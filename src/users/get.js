const Joi = require("joi");
const { insert, find, collections } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const bcrypt = require("bcryptjs");
const Boom = require("boom");
const { setTempPassword } = require("../common/setTempPassword");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const jwt = require("jsonwebtoken");
const { isLoggedIn } = require("../common/auth");
const ALIAS = { mentor: "newmuslim" };
const _ = require("lodash");
const { filter } = require("lodash");
function cleanUserData(jwt, users) {
  console.log("cleanUserData", { jwt });
  if (jwt.type === "superadmin" || (jwt.admins && jwt.admins.length > 0)) {
    return users;
  } else {
    return users.map((user) => {
      return jwt.gender && jwt.gender === user.gender
        ? user
        : { ...user, mobile: "(###) ###-####", email: "###@###" };
    });
  }
}
module.exports.handler = async (event) => {
  let team = event.queryStringParameters?.team;
  let type = event.queryStringParameters
    ? event.queryStringParameters.type
    : "volunteer";
  if (ALIAS[type]) {
    type = ALIAS[type];
  }
  try {
    const jwt = await isLoggedIn(event, true); //Verify superadmin

    if (!jwt) return lambdaReponse(Boom.unauthorized());
    if (
      jwt.type !== "org" &&
      jwt.type !== "superadmin" &&
      jwt.teams &&
      jwt.teams.indexOf(team) === -1 &&
      type === "volunteer"
    ) {
      return lambdaReponse(Boom.unauthorized());
    }

    let filter =
      jwt.type === "superadmin" && type === "pending"
        ? { groups: { $exists: false }, type: { $ne: "superadmin" } }
        : {
            groups: { $all: [type] },
          };
    let teams_filter = null;
    if (team) {
      filter.teams = { $all: [team] };
    }
    if (jwt.teams && jwt.teams.indexOf(team) > -1) {
      teams_filter = { $all: [team] };
    }
    const filter_org = {
      groups: { $all: [type] },
      created_by: jwt._id,
    };
    jwt.admins = jwt.admins ? jwt.admins : [];
    const non_admin_filter =
      type === "newmuslim"
        ? { _id: { $in: jwt.mentees ? jwt.mentees : [] } }
        : teams_filter
        ? {
            teams: teams_filter,
          }
        : null;

    const users = await find(
      collections.users,
      jwt.type === "superadmin" || jwt.type === "org"
        ? jwt.type === "superadmin"
          ? filter
          : filter_org
        : non_admin_filter
    );
    if (type === "newmuslim") {
      const mentees = await find(collections.users, {
        mentees: { $in: users.map((user) => user._id) },
      });
      if (mentees.length > 0) {
        for (let user of users) {
          let id = user._id;
          for (let mentee of mentees) {
            if (mentee.mentees.indexOf(id) > -1) {
              if (!user.assigned) {
                user.assigned = [];
              }
              user.assigned.push(
                jwt.type === "superadmin"
                  ? mentee
                  : {
                      _id: mentee._id,
                      first_name: mentee.first_name,
                      last_name: mentee.last_name,
                    }
              );
            }
          }
        }
      }
    }
    return lambdaReponse(cleanUserData(jwt, users));
  } catch (e) {
    console.log({ e });
    return lambdaReponse(Boom.unauthorized());
  }
};
module.exports.names = async (event) => {
  const ids = JSON.parse(event.body).ids;
  try {
    const jwt = await isLoggedIn(event); //Verify superadmin

    if (!jwt) return lambdaReponse(Boom.unauthorized());
    if (jwt.type === "superadmin" || jwt.admins.length > 0) {
    }
    const users = await find(collections.users, { _id: { $in: ids } });

    return lambdaReponse(
      _.keyBy(
        users.map((user) => {
          return {
            id: user._id,
            name: user.first_name
              ? user.first_name + " " + user.last_name
              : user.email,
          };
        }),
        "id"
      )
    );
  } catch (e) {
    console.log({ e });
    return lambdaReponse([]);
  }
};
