const Joi = require("joi");
const {
  insert,
  find,
  collections,
  deleteTempPassword,
  update,
} = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");

module.exports.handler = async (event) => {
  const eventId = event.pathParameters.event_id;
  const events = await find(collections.events, { _id: eventId });
  console.log({ events });
  return lambdaReponse(events[0]);
};
