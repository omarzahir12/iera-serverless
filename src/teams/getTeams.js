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
const { startCase, snakeCase, join, uniq, union } = require("lodash");
const { isLoggedIn } = require("../common/auth");

const createTeamValidator = {
  name: Joi.string().required(),
  description: Joi.string().required(),
};
module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event, true);
  console.log({ jwt });
  if (!jwt) {
    console.log({ jwt });
    return lambdaReponse(Boom.unauthorized);
  }
  const team_admin = event.queryStringParameters
    ? event.queryStringParameters.admin
    : null;
  let ids =
    jwt.type === "superadmin"
      ? []
      : team_admin
      ? jwt.admins
      : union(jwt.teams, jwt.admins);
  console.log({ ids });
  const filter = event.queryStringParameters
    ? event.queryStringParameters.filter
    : null;
  const teams =
    ids.length > 0 || jwt.type === "superadmin"
      ? await find(
          collections.teams,
          filter
            ? ids.length > 0
              ? { parent_team: filter, _id: { $in: ids } }
              : { parent_team: filter }
            : ids.length > 0
            ? { _id: { $in: ids } }
            : {}
        )
      : [];
  console.log({ teams });
  return lambdaReponse(
    teams.map((team) => {
      return { ...team, name: startCase(team._id) };
    })
  );
};
