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
  const teamId = event.pathParameters.team_id;
  const teams = await find(collections.sub_events, {
    status: "active",
    teamId,
  });
  return lambdaReponse(teams);
};
