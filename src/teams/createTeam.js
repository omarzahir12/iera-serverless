const Joi = require("joi");
const { insert, find, collections } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const { isLoggedIn } = require("../common/auth");
const { startCase, snakeCase } = require("lodash");

module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event);
  if (!jwt || jwt.type !== "superadmin")
    return lambdaReponse(Boom.unauthorized());
  const body = JSON.parse(event.body);

  const team = { ...body };
  team._id = snakeCase(team.name);
  delete team.name;
  await insert(collections.teams, team);
  return lambdaReponse({ ...team, name: startCase(team._id) });
};
