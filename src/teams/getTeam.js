const Joi = require("joi");
const {
  insert,
  find,
  collections,
  deleteTempPassword,
  update,
} = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const COLLECTION = mongodb.collections;
const bcrypt = require("bcryptjs");
const Boom = require("boom");
const cryptoRandomString = require("crypto-random-string");
const setTempPassword = require("../common/setTempPassword").setTempPassword;
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const { startCase, snakeCase } = require("lodash");
const { isLoggedIn } = require("../common/auth");

const createTeamValidator = {
  name: Joi.string().required(),
  description: Joi.string().required(),
};
module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event);
  if (!jwt || jwt.type !== "superadmin")
    return lambdaReponse(Boom.unauthorized());
  const teamId = event.pathParameters.team_id;
  const teams = await find(collections.teams, { _id: teamId });
  return lambdaReponse({ ...teams[0], name: startCase(teams[0]._id) });
};
