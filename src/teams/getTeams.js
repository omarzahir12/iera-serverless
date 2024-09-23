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
  let count = {};
  if (jwt.type === "superadmin") {
    const teams_count = await aggregate(collections.users, [
      {
        $unwind: "$teams",
      },
      {
        $group: {
          _id: "$teams",
          userCount: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          team: "$_id",
          userCount: 1,
        },
      },
    ]);
    const admins_count = await aggregate(collections.users, [
      {
        $unwind: "$admins",
      },
      {
        $group: {
          _id: "$admins",
          userCount: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          team: "$_id",
          userCount: 1,
        },
      },
    ]);
    count = {
      teams_count,
      admins_count,
    };
  }

  return lambdaReponse(
    teams.map((team) => {
      return {
        ...team,
        name: startCase(team._id),
        teams_count: count.teams_count
          ? count.teams_count.find((se) => se.team === team._id)?.userCount
          : 0,
        admins_count: count.admins_count
          ? count.admins_count.find((se) => se.team === team._id)?.userCount
          : 0,
        active_events: sub_events
          ? sub_events.find((se) => se._id === team._id)?.count
          : 0,
      };
    })
  );
};
