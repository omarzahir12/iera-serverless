const Joi = require("joi");
const {
  insert,
  find,
  collections,
  deleteTempPassword,
} = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const dd = require("./dd");
const processPostEvent = require("./processPostEvent").processPostEvent;
const Boom = require("boom");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const createEventValidator = {
  name: Joi.string().required(),
  description: Joi.string().required(),
  dates: Joi.array(),
  base64Image: Joi.string(),
  location: Joi.object(),
  status: Joi.string().valid("active", "inactive").default("active"),
};
module.exports.handler = async (e) => {
  const teamId = e.pathParameters.team_id;
  const body = JSON.parse(e.body);
  /*const result = Joi.validate(body, createEventValidator)
    if (typeof obj !== 'object' || result.error) {
        return lambdaReponse(Boom.badRequest(result.error))
    }*/
  const event = body; //result.value
  event._id = uuidv4();
  event.teamId = teamId;
  await insert(collections.events, { ...event });
  await processPostEvent(event, teamId);

  return lambdaReponse(event);
};
