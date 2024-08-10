const { collections, update, find } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;

const {
  addNewEntryStreetDawahList,
  addNewEntryNewMuslimWeeklyTrackerList,
} = require("../common/microsoft");

module.exports.sync_event_reports = async (event) => {
  const reports = await find(collections.reports, {
    type: "event_report",
    "reports.status": "submitted",
    "reports.$.entry_id": { $exists: false },
  });
  let submitted = 0;
  for (let report of reports) {
    for (let event_report of report.reports) {
      if (event_report.status === "submitted" && !event_report.entry_id) {
        submitted++;
        const entryResponse = await addNewEntryStreetDawahList(
          event_report.id,
          event_report.submit,
          report
        );
        if (entryResponse && entryResponse?.fields?.id) {
          await update(
            collections.reports,
            { "reports.id": event_report.id },
            { "reports.$.entry_id": entryResponse.fields.id },
            true
          );
        }
      }
    }
  }
  return lambdaReponse({ submitted, reports });
};
module.exports.sync_mentor_reports = async (event) => {
  const reports = await find(collections.reports, {
    type: "mentor",
    "reports.status": "submitted",
    "reports.$.entry_id": { $exists: false },
  });
  let submitted = 0;
  for (let report of reports) {
    for (let event_report of report.reports) {
      if (
        event_report.status === "submitted" &&
        !event_report.entry_id &&
        event_report.submit.did_you
      ) {
        submitted++;
        const entryResponse = await addNewEntryNewMuslimWeeklyTrackerList(
          event_report.id,
          event_report.submit,
          report
        );
        if (entryResponse && entryResponse?.fields?.id) {
          await update(
            collections.reports,
            { "reports.id": event_report.id },
            { "reports.$.entry_id": entryResponse.fields.id },
            true
          );
        }
      }
    }
  }
  return lambdaReponse({ submitted, reports });
};
