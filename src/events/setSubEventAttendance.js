const Joi = require("joi");
const {
  insert,
  find,
  collections,
  deleteTempPassword,
  addToSet,
  removeFromSet,
  push,
} = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const { isLoggedIn } = require("../common/auth");
const ifPast = async function (jwt, eventId) {
  const reports = await find(collections.reports, {
    _id: eventId,
    "reports.mentor_id": jwt._id,
  });
  if (reports.length === 0) {
    const ev = await find(collections.sub_events, { _id: eventId });
    await push(
      collections.reports,
      { _id: eventId, type: "event_report", meta: ev[0].name },
      {
        reports: {
          id: uuidv4(),
          status: "pending",
          submit: null,
          meta: ev[0].name,
          created_at: new Date(),
          mentor_id: jwt._id,
          user: {
            _id: jwt._id,
            first_name: jwt.first_name,
            last_name: jwt.last_name,
          },
        },
      },
      true
    );
  }
};
module.exports.handler = async (event) => {
  const past =
    event.queryStringParameters && event.queryStringParameters.past === "true"
      ? true
      : false;
  const teamId = event.pathParameters.team_id;
  const eventId = event.pathParameters.sub_event_id;
  const body = JSON.parse(event.body);
  const jwt = await isLoggedIn(event, true);
  if (!jwt) {
    console.log({ jwt });
    return lambdaReponse(Boom.unauthorized);
  }
  //TODO -- if past event or if report=true then regenerate reports for new user
  await addToSet(
    collections.sub_events,
    { _id: eventId },
    {
      attendance: {
        ...body,
        id: jwt._id,
        user: {
          id: jwt._id,
          first_name: jwt.first_name,
          last_name: jwt.last_name,
        },
      },
    }
  );
  if (past) {
    await ifPast(jwt, eventId);
  }
  return lambdaReponse({});
};
module.exports.remove = async (event) => {
  const eventId = event.pathParameters.sub_event_id;
  const jwt = await isLoggedIn(event);
  if (!jwt) {
    console.log({ jwt });
    return lambdaReponse(Boom.unauthorized);
  }
  await removeFromSet(
    collections.sub_events,
    { _id: eventId },
    { attendance: { id: jwt._id } }
  );
  return lambdaReponse({});
};
module.exports.setById = async (event) => {
  const past =
    event.queryStringParameters && event.queryStringParameters.past === "true"
      ? true
      : false;
  const teamId = event.pathParameters.team_id;
  const eventId = event.pathParameters.sub_event_id;
  const user_id = event.pathParameters.user_id;
  const body = JSON.parse(event.body);
  const jwt = await isLoggedIn(event);
  if (!jwt || (jwt.admins.length === 0 && jwt.type !== "superadmin")) {
    console.log({ jwt });
    return lambdaReponse(Boom.unauthorized);
  }
  const user = await find(collections.users, { _id: user_id });
  if (user.length === 0) {
    return lambdaReponse(Boom.notFound);
  }
  //TODO -- if past event or if report=true then regenerate reports for new user
  await addToSet(
    collections.sub_events,
    { _id: eventId },
    {
      attendance: {
        ...body,
        id: user_id,
        user: {
          id: user_id,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      },
    }
  );
  if (past) {
    await ifPast(jwt, eventId);
  }
  return lambdaReponse({});
};
module.exports.removeById = async (event) => {
  const eventId = event.pathParameters.sub_event_id;
  const user_id = event.pathParameters.user_id;
  const jwt = await isLoggedIn(event);
  if (!jwt || (jwt.admins.length === 0 && jwt.type !== "superadmin")) {
    console.log({ jwt });
    return lambdaReponse(Boom.unauthorized);
  }
  await removeFromSet(
    collections.sub_events,
    { _id: eventId },
    { attendance: { id: user_id } }
  );
  return lambdaReponse({});
};
