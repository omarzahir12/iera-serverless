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
const { newMuslimAdded } = require("../common/email");
//const { sendWelcomeNewMuslim } = require("../common/email");

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const email = body.email.toLowerCase();
  const _id = uuidv5(email, uuidv5.URL);
  //TODO allow only superadmin to create orgs and new muslim and orgs to create newmuslim
  try {
    const jwt = await isLoggedIn(event, true);
    if (!jwt) return lambdaReponse(Boom.unauthorized());
    user = {
      _id,
      ...body,
      created_on: new Date(),
      updated_on: new Date(),
      created_by: jwt._id,
    };
    try {
      await insert(collections.users, user);
      await newMuslimAdded({
        email,
        first_name: body.first_name,
        last_name: body.last_name,
        type: jwt.type === "org" ? "By Organization" : "By Volunteer",
        phone: body.phone,
        who:
          jwt.first_name +
          " " +
          jwt.last_name +
          (jwt.type === "org" ? "(Organization)" : "(Volunteer)"),
      });
      //await sendWelcomeNewMuslim(email, body.first_name);
      return lambdaReponse({ status: "inserted" });
    } catch (e) {
      return lambdaReponse(Boom.notAcceptable("email is already registered"));
    }
  } catch (e) {
    return lambdaReponse(Boom.unauthorized());
  }
};
