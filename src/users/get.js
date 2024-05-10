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
module.exports.handler = async (event) => {
  let type = event.queryStringParameters
    ? event.queryStringParameters.type
    : "volunteer";
  if (ALIAS[type]) {
    type = ALIAS[type];
  }
  try {
    const jwt = await isLoggedIn(event, true); //Verify superadmin

    if (!jwt) return lambdaReponse(Boom.unauthorized());

    const users = await find(
      collections.users,
      jwt.type === "superadmin"
        ? {
            groups: { $all: [type] },
          }
        : { _id: { $in: jwt.mentees ? jwt.mentees : [] } }
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
    return lambdaReponse(users);
  } catch (e) {
    console.log({ e });
    return lambdaReponse(Boom.unauthorized());
  }
};
