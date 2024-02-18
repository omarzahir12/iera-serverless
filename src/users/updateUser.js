const Joi = require("joi");
const { collections, update } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  PutObjectCommandInput,
} = require("@aws-sdk/client-s3"); // ES Modules import

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

module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event);
  if (!jwt) return lambdaReponse(Boom.unauthorized());

  const userId = event.pathParameters.user_id;
  const body = JSON.parse(event.body);

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

  await update(collections.users, { _id: userId }, body);

  return lambdaReponse({ _id: userId, ...body }, 201);
};
