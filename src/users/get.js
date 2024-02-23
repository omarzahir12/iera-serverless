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
    return lambdaReponse(users);
  } catch (e) {
    console.log({ e });
    return lambdaReponse(Boom.unauthorized());
  }
};
