const Joi = require("joi");
const {
  insert,
  find,
  aggregate,
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
  let ids = jwt.type === "superadmin" ? [] : union(jwt.teams, jwt.admins);
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
  const start = event.queryStringParameters
    ? event.queryStringParameters.past
      ? { $lte: new Date() }
      : { $gt: new Date() }
    : { $gt: new Date() };
  console.log({ start });
  const sub_events =
    team_admin === "true"
      ? await aggregate(collections.sub_events, [
          {
            $match: {
              start,
              status: "active",
            },
          },
          {
            $group: {
              _id: "$teamId",
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              start: 1,
            },
          },
        ])
      : null;
  return lambdaReponse(
    teams.map((team) => {
      return {
        ...team,
        name: startCase(team._id),
        active_events: sub_events
          ? sub_events.find((se) => se._id === team._id)?.count
          : 0,
      };
    })
  );
};
