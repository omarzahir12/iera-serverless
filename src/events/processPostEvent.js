const Joi = require("joi");
const {
  insert,
  find,
  collections,
  deleteTempPassword,
} = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const dd = require("./dd");

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
module.exports.processPostEvent = async (event, teamId) => {
  if (event.event_type === "recurring" && event.status === "active") {
    const sub_events = await find(collections.sub_events, {
      status: "active",
      teamId,
      start: { $gte: new Date() },
    });
    //console.log({ sub_events });
    if (sub_events.length < event.active_events) {
      const needed = event.active_events - sub_events.length;
      const dates = dd.getDates(event.start, event.active_events, needed);
      let toAdd = [];
      for (let a = 0; a < dates.length; a++) {
        toAdd.push({
          _id: uuidv4(),
          name: event.name,
          description: event.description,
          city: event.city,
          min_participants: event.min_participants,
          teamId,
          event_type: "sub_event",
          parent_id: event._id,
          status: "active",
          start: new Date(dates[a]),
          event_length: event.event_length,
        });
      }
      //console.log({ toAdd, dates });
      await insert(collections.sub_events, toAdd);
    }
  }
};
