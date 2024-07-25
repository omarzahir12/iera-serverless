const Joi = require("joi");
const { collections, update, find, push, insert } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommandInput,
} = require("@aws-sdk/client-s3"); // ES Modules import
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const {
  addNewEntryStreetDawahList,
  addNewEntryNewMuslimWeeklyTrackerList,
} = require("../common/microsoft");

const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_ID;
const secretAccessKey = process.env.R2_ACCESS_SECRET;
const bucket = process.env.R2_BUCKET;
const S3 = new S3Client({
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  region: "auto",
});
const { isLoggedIn } = require("../common/auth");
const { last } = require("underscore");
const { filter, upperFirst } = require("lodash");
const moment = require("moment");
module.exports.create = async (event) => {
  //Events
  const start = { $lte: new Date() };
  const events = await find(collections.sub_events, {
    status: "active",
    report: { $exists: false },
    start,
  });
  let eventIds;
  for (let event of events) {
    const _id = event._id;

    if (event.attendance && event.attendance.length > 0) {
      const att = event.attendance;
      const reports = att.map((a) => {
        return {
          id: uuidv4(),
          meta: event.name,
          created_at: new Date(),
          mentor_id: a.id,
          status: "pending",
          submit: null,
          user: {
            _id: a.id,
            first_name: a.user.first_name,
            last_name: a.user.last_name,
          },
        };
      });
      console.log({ reports });
      await insert(
        collections.reports,
        { _id, type: "event_report", reports, meta: event.name },
        null
      );
    }
    await update(collections.sub_events, { _id }, { report: true });
  }

  return lambdaReponse({ events });
};
//Need to make sure only executes once a week
module.exports.create_for_mentors = async (event) => {
  const dd = moment().startOf("week").subtract(2, "day").format("YYYY-MM-DD");
  const exec = await find(collections.exec, {
    _id: "create_for_mentors",
    "dates.date": dd,
  });
  //Mentees
  if (exec.length === 0) {
    const users = await find(collections.users, {
      mentees: { $exists: true },
    });
    for (let user of users) {
      if (user.mentees.length > 0) {
        for (let mentee of user.mentees) {
          await push(
            collections.reports,
            { _id: mentee, type: "mentor" },
            {
              reports: {
                id: uuidv4(),
                meta: "Mentor",
                created_at: new Date(),
                mentor_id: user._id,
                status: "pending",
                submit: null,
                user: {
                  _id: user._id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                },
              },
            },
            true
          );
        }
      }
    }
    await push(
      collections.exec,
      { _id: "create_for_mentors" },
      { dates: { date: dd } },
      true
    );
  }

  return lambdaReponse({ exec });
};

module.exports.gets = async (event) => {
  const jwt = await isLoggedIn(event, true);
  if (!jwt) return lambdaReponse(Boom.unauthorized());
  const status =
    event.queryStringParameters && event.queryStringParameters.status
      ? event.queryStringParameters.status
      : "pending";
  //const report_id = event.pathParameters.report_id;
  const reports = await find(
    collections.reports,
    jwt.type === "superadmin"
      ? {
          "reports.status": status,
        }
      : {
          "reports.status": status,
          "reports.mentor_id": jwt._id,
        }
  );
  let toSend = [];
  for (let r of reports) {
    for (let report of r.reports) {
      if (
        report.status === status &&
        (jwt.type === "superadmin" || report.mentor_id === jwt._id)
      )
        toSend.push({
          ...report,
          type: r.type,
          _id: r._id,
          meta: r.meta ? r.meta : report.meta,
        });
    }
  }
  console.log({ toSend });

  return lambdaReponse(toSend);
};

module.exports.update = async (event) => {
  const report_id = event.pathParameters.report_id;

  const user = await isLoggedIn(event, true);
  if (!user) return lambdaReponse(Boom.unauthorized());
  let body = JSON.parse(event.body);
  if (body.type) delete body.type;
  if (body._id) delete body._id;

  let toDB = {};
  for (let k in body) {
    toDB["reports." + k] = body[k];
  }

  const eventReport = await update(
    collections.reports,
    { "reports.id": report_id },
    { "reports.$.submit": body, "reports.$.status": "submitted" },
    true
  );

  // If the report is not found in the database return 404
  if (!eventReport || eventReport.length === 0) {
    return lambdaReponse(Boom.notFound());
  }

  // add a new entry in the Street Dawah or New Muslim Weekly Tracker list based on the report type
  try {
    // Check if the report type is event_report
    const isEventReport = eventReport[0]?.type === "event_report";
    // Call the appropriate function to add a new entry in the Street Dawah or New Muslim Weekly Tracker list
    const updateFunction = isEventReport
      ? addNewEntryStreetDawahList
      : addNewEntryNewMuslimWeeklyTrackerList;

    // Call the appropriate function to add a new entry in the Street Dawah or New Muslim Weekly Tracker list
    const entryResponse = await updateFunction(report_id, body, eventReport[0]);

    // If the entry is added successfully, update the report with the entry id
    if (entryResponse && entryResponse?.fields?.id) {
      // Update the report with the entry id
      await update(
        collections.reports,
        { "reports.id": report_id },
        { "reports.$.entry_id": entryResponse.fields.id },
        true
      );
    }
  } catch (error) {
    console.log("Error adding new entry in Street Dawah list", error);
  }

  return lambdaReponse({ toDB, report_id }, 201);
};
module.exports.get = async (event) => {
  //TODO
  const jwt = await isLoggedIn(event, true);
  if (!jwt) return lambdaReponse(Boom.unauthorized());

  let toSend = [];

  return lambdaReponse(toSend);
};
