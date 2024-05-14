const Joi = require("joi");
const { collections, update, find, push } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
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
const { filter } = require("lodash");
module.exports.create = async (event) => {
  const jwt = await isLoggedIn(event);
  if (!jwt) return lambdaReponse(Boom.unauthorized());

  const type = event.pathParameters.type;
  const _id = event.pathParameters._id;
  //const report_id = event.pathParameters.report_id;

  const body = JSON.parse(event.body);

  await push(
    collections.reports,
    { _id, type },
    {
      reports: {
        ...body,
        created_at: new Date(),
        mentor_id: jwt._id,
        user: {
          _id: jwt._id,
          first_name: jwt.first_name,
          last_name: jwt.last_name,
        },
      },
    },
    true
  );

  return lambdaReponse({ _id }, 201);
};

module.exports.gets = async (event) => {
  const jwt = await isLoggedIn(event, true);
  if (!jwt) return lambdaReponse(Boom.unauthorized());
  const type = event.pathParameters.type;
  const _id = event.pathParameters._id;
  //const report_id = event.pathParameters.report_id;
  const reports = await find(collections.reports, { _id, type });
  console.log({ type, _id, reports });

  if (reports.length > 0) {
    let toSend = reports[0].reports;
    if (jwt.admins) {
      let subevents = await find(collections.sub_events, {
        _id,
        teamId: { $in: jwt.admins },
      });
      if (subevents.length === 0) {
        if (type === "event_report" && jwt.type !== "superadmin") {
          toSend = filter(toSend, (o) => {
            return o.user._id === jwt._id;
          });
        }
      }
    }

    /**/
    return lambdaReponse(toSend);
  } else {
    return lambdaReponse([]);
  }
};
module.exports.get = async (event) => {
  const jwt = await isLoggedIn(event);
  if (!jwt) return lambdaReponse(Boom.unauthorized());
  const type = event.pathParameters.type;
  const _id = event.pathParameters._id;
  const report_id = event.pathParameters.report_id;
  const reports = await find(collections.reports, { _id, type });
  if (reports.length > 0) {
    return lambdaReponse(reports[0].reports[report_id]);
  } else {
    return lambdaReponse(Boom.notFound());
  }
};
