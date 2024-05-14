const Joi = require("joi");
const {
  insert,
  find,
  collections,
  deleteTempPassword,
  addToSet,
  removeFromSet,
} = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const { isLoggedIn } = require("../common/auth");

module.exports.handler = async (event) => {
  const teamId = event.pathParameters.team_id;
  const eventId = event.pathParameters.sub_event_id;
  const body = JSON.parse(event.body);
  const jwt = await isLoggedIn(event);
  if (!jwt) {
    console.log({ jwt });
    return lambdaReponse(Boom.unauthorized);
  }
  await addToSet(
    collections.sub_events,
    { _id: eventId },
    { attendance: { ...body, id: jwt._id } }
  );
  return lambdaReponse({});
};
module.exports.remove = async (event) => {
  const teamId = event.pathParameters.team_id;
  const eventId = event.pathParameters.sub_event_id;
  const body = JSON.parse(event.body);

  const jwt = await isLoggedIn(event);
  if (!jwt) {
    console.log({ jwt });
    return lambdaReponse(Boom.unauthorized);
  }
  await removeFromSet(
    collections.sub_events,
    { _id: eventId },
    { attendance: { ...body, id: jwt._id } }
  );
  return lambdaReponse({});
};
