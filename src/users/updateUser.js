const fs = require('fs');
const path = require('path');

const POSTAL_CODE_FILE = path.join(__dirname, '../common/zipcodes_ca.json');
const postal_data = fs.readFileSync(POSTAL_CODE_FILE, 'utf8');

const postalCodeToCity = JSON.parse(postal_data);

function findCityByPostalCode(postalCode) {
  const prefix = postalCode.replace(/\s/g, '').slice(0, 3).toUpperCase();
  return postalCodeToCity[prefix];
}

const Joi = require("joi");
const { collections, update, find } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommandInput,
} = require("@aws-sdk/client-s3"); // ES Modules import
const { newVolunteerAdded } = require("../common/email");
const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_ID;
const secretAccessKey = process.env.R2_ACCESS_SECRET;
const bucket = process.env.R2_BUCKET;
const S3 = new S3Client({
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  region: "auto",
});
const { isLoggedIn } = require("../common/auth");
const { last } = require("underscore");
const {
  sendWelcome,
  volApproval,
  volRefused,
  newMuslimAdded,
} = require("../common/email");
module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event, true);
  if (!jwt) return lambdaReponse(Boom.unauthorized());

  const userId = event.pathParameters.user_id;
  const body = JSON.parse(event.body);
  const toEmail = body.email;
  if (body.email) delete body.email;
  if (body._id) delete body._id;
  if (jwt.type !== "superadmin" && userId !== jwt._id) {
    return lambdaReponse(Boom.unauthorized());
  }
  if (!body.city && body.postal_code) { //If city not present
    const matchedCity = findCityByPostalCode(body.postal_code);
    if (matchedCity)
      body.city = matchedCity;
  }
  for (let item in body) {
    const key = body[item];
    if (typeof key === "object") {
      for (let i in key) {
        const item = key[i];
        if (item.dataURL) {
          const Key = `${userId}/ids/${item._id}`;
          const obj = {
            ACL: ObjectCannedACL.private,
            Body: Buffer.from(last(item.dataURL.split("base64,")), "base64"),
            Bucket: bucket,
            Key,
            ContentEncoding: "base64",
            ContentType: item.mime,
            Metadata: {
              mime: item.mime,
              size: item.size,
              filename: item.filename,
            },
          };

          const command = new PutObjectCommand({
            ACL: ObjectCannedACL.private,
            Body: Buffer.from(last(item.dataURL.split("base64,")), "base64"),
            Bucket: bucket,
            Key,
            ContentEncoding: "base64",
            ContentType: item.mime,
            Metadata: {
              mime: item.mime,
              size: "" + item.size,
              filename: item.filename,
            },
          });
          const response = await S3.send(command);
          delete response.$metadata;
          delete key[item._id].dataURL;
          key[item._id] = {
            ...key[item._id],
            ...response,
            key: Key,
          };
        }
      }
    }
  }
  const oUser = await find(collections.users, { _id: userId });
  await update(
    collections.users,
    { _id: userId },
    { ...body, updated_on: new Date() }
  );
  if (body.groups.indexOf("volunteer") > -1) {
    if (!jwt.status && body.status === "enrolled") {
      const formTemplate = await find(collections.form_templates, {
        _id: "volunteer",
      });
      const form = formTemplate[0].form;
      const ignore_fields = ["ids", "birth_year"];
      let details = "";
      for (let item of form) {
        if (body[item.name] && ignore_fields.indexOf(item.name) === -1) {
          details +=
            (item.info ? item.info : item.label) +
            ": " +
            body[item.name] +
            "<br>";
        }
      }

      await newVolunteerAdded({
        first_name: body.first_name,
        last_name: body.last_name,
        details,
      });
    }
    if (
      jwt.type !== "superadmin" &&
      !jwt.status &&
      body.status === "enrolled"
    ) {
      await sendWelcome(jwt.email);
    }
    if (
      jwt.type === "superadmin" &&
      body.status === "approved" &&
      oUser[0].status !== "approved"
    ) {
      await volApproval(toEmail);
    }
    if (
      jwt.type === "superadmin" &&
      body.status === "rejected" &&
      oUser[0].status !== "rejected"
    ) {
      await volRefused(toEmail);
    }
  } else if (body.groups.indexOf("newmuslim") > -1 && jwt._id === userId) {
    await newMuslimAdded({
      first_name: body.first_name,
      last_name: body.last_name,
      email: jwt.email,
      phone: body.phone,
      who: "Self Registration",
      type: "Self Registration",
    });
    await sendWelcomeNewMuslim(jwt.email, body.first_name);
  }
  return lambdaReponse({ _id: userId, ...body }, 201);
};

module.exports.getImage = async (event) => {
  const userId = event.pathParameters.user_id;
  const imageId = event.pathParameters.image_id;
  const Key = `${userId}/ids/${imageId}`;
  try {
    const jwt = await isLoggedIn(event); //Verify superadmin
    if (jwt) {
      //&& jwt.type !== "superadmin"
      if (jwt.type !== "superadmin" && userId !== jwt._id) {
        return lambdaReponse(Boom.unauthorized());
      }
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key,
      });
      const response = await S3.send(command);

      return lambdaReponse({
        image: await response.Body.transformToString("base64"),
      });
    }
  } catch (e) {}
  return lambdaReponse(Boom.notFound(Key));
};