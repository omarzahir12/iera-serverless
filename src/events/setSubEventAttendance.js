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

module.exports.handler = async (event) => {
  const past =
    event.queryStringParameters && event.queryStringParameters.past === "true"
      ? true
      : false;
  const teamId = event.pathParameters.team_id;
  const eventId = event.pathParameters.sub_event_id;
  const body = JSON.parse(event.body);
  const jwt = await isLoggedIn(event);
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
    const reports = await find(collections.reports, {
      _id: eventId,
      "reports.mentor_id": jwt._id,
    });
    if (reports.length === 0)
      await push(
        collections.reports,
        { _id: eventId },
        {
          reports: {
            id: uuidv4(),
            status: "pending",
            submit: null,

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
