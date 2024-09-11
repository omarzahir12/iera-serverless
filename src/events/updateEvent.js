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
const processPostEvent = require("./processPostEvent").processPostEvent;
const { isLoggedIn } = require("../common/auth");

const createEventValidator = {
  name: Joi.string().required(),
  description: Joi.string().required(),
  dates: Joi.array(),
  location: Joi.object(),
  base64Image: Joi.string(),
  status: Joi.string().valid("active", "inactive").default("active"),
};
module.exports.handler = async (ev) => {
  const jwt = await isLoggedIn(ev, true);
  if (!jwt) return lambdaReponse(Boom.unauthorized());
  const teamId = ev.pathParameters.team_id;
  const eventId = ev.pathParameters.event_id;
  const body = JSON.parse(ev.body);
  /*const result = Joi.validate(body, createEventValidator)
    if (typeof obj !== 'object' || result.error) {
        return lambdaReponse(Boom.badRequest(result.error))
    }*/
  const event = body; //result.value
  await update(collections.events, { _id: eventId, teamId }, event);
  const events_from_db = await find(collections.events, {
    _id: eventId,
  });
  const event_from_db = events_from_db[0];
  await processPostEvent(event_from_db, teamId);
  return lambdaReponse(event_from_db);
};
