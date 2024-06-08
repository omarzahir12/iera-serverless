const Joi = require("joi");
const {
  insert,
  find,
  collections,
  deleteTempPassword,
  update,
} = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");

module.exports.handler = async (event) => {
  const start = event.queryStringParameters
    ? event.queryStringParameters.past
      ? { $lte: new Date() }
      : { $gt: new Date() }
    : { $gt: new Date() };
  const teamId = event.pathParameters.team_id;
  console.log({ start });
  const teams = await find(
    collections.sub_events,
    {
      status: "active",
      teamId,
      start,
    },
    null,
    null,
    null,
    { start: 1 }
  );
  return lambdaReponse(teams);
};
