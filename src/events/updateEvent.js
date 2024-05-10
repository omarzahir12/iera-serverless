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
  const event = body; //result.value
  await update(collections.events, { _id: eventId, teamId }, event);
  const events_from_db = await find(collections.events, {
    _id: eventId,
  });
  const event_from_db = events_from_db[0];
  if (
    event_from_db.event_type === "recurring" &&
    event_from_db.status === "active"
  ) {
    const sub_events = await find(collections.sub_events, {
      status: "active",
      teamId,
      start: { $gte: new Date() },
    });
    if (event_from_db.active_events < sub_events.length) {
      const needed = event_from_db.active_events - sub_events.length;
      let toAdd = [];
      for (let a = 0; a < needed; a++) {
        toAdd.push({
          _id: uuidv4(),
          name: event_from_db.name,
          description: event_from_db.description,
          city: event_from_db.city,
          min_participants: event_from_db.min_participants,
          team_id: event_from_db.team_id,
          event_type: "sub_event",
          parent_id: event_from_db._id,
          status: "active",
          start,
          end,
        });
      }
    }
  }

  return lambdaReponse({ _id: eventId, ...event });
};
