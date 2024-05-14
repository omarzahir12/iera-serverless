const Joi = require("joi");
const {
  insert,
  find,
  collections,
  deleteTempPassword,
  update,
} = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const dd = require("./dd");
const Boom = require("boom");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");

const createEventValidator = {
  name: Joi.string().required(),
  description: Joi.string().required(),
  dates: Joi.array(),
  location: Joi.object(),
  base64Image: Joi.string(),
  status: Joi.string().valid("active", "inactive").default("active"),
};
module.exports.handler = async (event) => {
  const teamId = event.pathParameters.team_id;
  const eventId = event.pathParameters.event_id;
  const body = JSON.parse(event.body);
  /*const result = Joi.validate(body, createEventValidator)
    if (typeof obj !== 'object' || result.error) {
        return lambdaReponse(Boom.badRequest(result.error))
    }*/
  if (body.start) {
    body.start = new Date(body.start);
  }
  await update(collections.sub_events, { _id: eventId, teamId }, body);

  return lambdaReponse({ _id: eventId, ...body });
};
