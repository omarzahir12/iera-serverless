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
const { startCase, snakeCase } = require("lodash");
const { isLoggedIn } = require("../common/auth");

const createTeamValidator = {
  name: Joi.string().required(),
  description: Joi.string().required(),
};
module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event);
  //console.log({ jwt });
  if (!jwt || jwt.type !== "superadmin")
    return lambdaReponse(Boom.unauthorized());
  const filter = event.queryStringParameters
    ? event.queryStringParameters.filter
    : null;
  const teams = await find(
    collections.teams,
    filter ? { parent_team: filter } : {}
  );
  console.log({ teams });
  return lambdaReponse(
    teams.map((team) => {
      return { ...team, name: startCase(team._id) };
    })
  );
};
