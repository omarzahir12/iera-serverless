const Joi = require("joi");
const { insert, find, collections } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const bcrypt = require("bcryptjs");
const Boom = require("boom");
const { setTempPassword } = require("../common/setTempPassword");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const jwt = require("jsonwebtoken");
const { isLoggedIn } = require("../common/auth");

module.exports.getTemplate = async (event) => {
  const jwt = await isLoggedIn(event);
  if (!jwt) return lambdaReponse(Boom.unauthorized());
  const form_id = event.pathParameters.form_id;

  const templates = await find(collections.form_templates, {
    _id: form_id,
  });
  if (templates.length > 0) {
    const template = templates[0];
    return lambdaReponse(template.form);
  } else {
    return lambdaReponse(Boom.notFound());
  }
};
