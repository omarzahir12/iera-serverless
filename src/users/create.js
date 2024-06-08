const Joi = require("joi");
const {
  insert,
  find,
  collections,
  deleteTempPassword,
} = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const { isLoggedIn } = require("../common/auth");

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const email = body.email.toLowerCase();
  const _id = uuidv5(email, uuidv5.URL);
  //TODO allow only superadmin to create orgs and new muslim and orgs to create newmuslim
  try {
    const jwt = await isLoggedIn(event);
    if (!jwt) return lambdaReponse(Boom.unauthorized());
    user = { _id, ...body, created_on: new Date(), updated_on: new Date() };
    try {
      await insert(collections.users, user);
      return lambdaReponse({ status: "inserted" });
    } catch (e) {
      return lambdaReponse(Boom.notAcceptable("email is already registered"));
    }
  } catch (e) {
    return lambdaReponse(Boom.unauthorized());
  }
};
