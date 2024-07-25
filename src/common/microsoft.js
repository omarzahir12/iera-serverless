const { find, collections, aggregate } = require("../common/mongo");
const { getMicrosoftAccessToken } = require("../events/microsoftToken");

const startCase = require("lodash/startCase");
const capitalize = require("lodash/capitalize");

// Variables for the Microsoft Graph API Authentication
const tenantId = process.env.MICROSOFT_TENANT_ID;
const clientId = process.env.MICROSOFT_CLIENT_ID;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
const scope = process.env.MICROSOFT_SCOPE;

// Variables for the SharePoint Street Dawah List
const streetDawahSiteId = process.env.SHAREPOINT_STREET_DAWAH_SITE_ID;
const streetDawahListId = process.env.SHAREPOINT_STREET_DAWAH_LIST_ID;

// Variables for the SharePoint New Muslim Weekly Tracker List
const newMuslimWeeklyTrackerSiteId =
  process.env.SHAREPOINT_NEW_MUSLIM_WEEKLY_TRACKER_SITE_ID;
const newMuslimWeeklyTrackerListId =
  process.env.SHAREPOINT_NEW_MUSLIM_WEEKLY_TRACKER_LIST_ID;

// Constant for the "Not Applicable" string
const NOT_APPLICABLE = "Not Applicable";

/**
 * Get an access token from the Microsoft Graph API
 * @returns {string} The access token
 */
const getAccessToken = async () => {
  const accessToken = await fetch(
    `https://accounts.accesscontrol.windows.net/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `client_id=${clientId}&scope=${scope}&client_secret=${clientSecret}&grant_type=client_credentials`,
    }
  )
    .then((res) => res.json())
    .catch((err) => {
      console.error("Error to get Graph API access token", err);

      return null;
    });

  return accessToken;
};

/**
 * Add a new list item in a SharePoint list
 * @param {string} siteId The ID of the site
 * @param {string} listId The ID of the list
 * @param {object} item The item to add
 * @returns {object} The JSON response from the API
 */
const addNewListItem = async (siteId, listId, item) => {
  // Get the access token
  const accessToken = await getMicrosoftAccessToken();

  // Add the list item
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Host: "graph.microsoft.com",
      },
      body: JSON.stringify(item),
    }
  )
    .then((res) => res.json())
    .catch((err) => {
      console.error("Error to add Graph API list item", err);
    });

  // Return the response
  return response;
};

/**
 * Add a new entry in the Street Dawah list
 * @param {string} reportId The ID of the report from DB
 * @param {object} form The form data
 * @param {object} user The user data
 * @returns {Promise} The response from the API
 */
const addNewEntryStreetDawahList = async (
  reportId = "",
  form = {},
  eventReport = {}
) => {
  // Get the report and user data from the event report
  const report = eventReport?.reports?.find((r) => r.id === reportId);
  const user = report?.user;

  // Get the sub event data from the event report
  const subEvents = await find(collections.sub_events, {
    _id: eventReport._id,
  });
  const subEvent = subEvents[0];

  // Get the volunteer date, team name, start time, and end time
  const volunteerDate = report?.created_at;
  const teamName = startCase(subEvent?.teamId);
  const startTime = new Date(subEvent?.start);
  const endTime = new Date(subEvent?.start);
  endTime.setHours(endTime.getHours() + Number(subEvent?.event_length));

  const item = {
    fields: {
      Title: user.first_name + " " + user.last_name, // string ex. "John Doe"
      VolunteerDate: volunteerDate, // string ex. "2024-07-15T00:00:00Z"
      NumberofChats: Number(form.chats), // number ex. 12 / 12.0
      NumberofQualityChats: Number(form.chats_quality), // number ex. 10 / 10.0
      NumberofShahadas: Number(form.shahada), // number ex. 2 / 2.0
      NumberofPamphletshandedout: Number(form.materials), // number ex. 100 / 100.0
      // string ex. "2024-07-15T00:00:00Z"
      SubmissionTime: new Date().toISOString(),
      Team: teamName, // string ex. "Mississauga"
      Absent: form.attend === "no", // boolean ex. true / false
      AbsenceReason: form.attend_no || "", // string ex. "Sick"
      End_x0020_Time: startTime.toISOString(), // number ex. 30 / 30.0
      Start_x0020_Time: endTime.toISOString(), // number ex. 30 / 30.0
      No_x002e_OfQurancopies: Number(form.quran), // number ex. 10 / 10.0
      Comments: form.comments, // string ex. "Great day!"
      FromApp: true, // boolean ex. true / false
      Report_x0020_ID: reportId, // string ex. "1234"
    },
  };

  // Add the new list item in the SharePoint list and return the response
  return addNewListItem(streetDawahSiteId, streetDawahListId, item);
};

/**
 * Add a new entry in the New Muslim Weekly Tracker list
 * @param {string} reportId The ID of the report from DB
 * @param {object} form The form data
 * @param {object} user The user data
 * @returns {Promise} The response from the API
 */
const addNewEntryNewMuslimWeeklyTrackerList = async (
  reportId = "",
  form = {},
  eventReport = {}
) => {
  // Get the report and user data from the event report
  const report = eventReport?.reports?.find((r) => r.id === reportId);
  // MenteeId is the eventReport ID
  const menteeId = eventReport._id;
  // MentorId is the mentor_id in the report
  const mentorId = report?.user?._id;

  // Get the user data from the database
  const users = await find(collections.users, {
    _id: { $in: [menteeId, mentorId] },
  });

  // Get the mentee and mentor data
  const mentee = users.find((u) => u._id === menteeId);
  const mentor = users.find((u) => u._id === mentorId);

  // Check if the mentor talked with the mentee from FORM
  const isMentorTalked = form.did_you === "yes";

  // Get the form option for the "which_lesson" or "why" forms, based on the "did_you" form, if mentor talked with the mentee we check the "which_lesson" form, otherwise we check the "why" form
  const formName = isMentorTalked ? "which_lesson" : "why";
  const formOption = await aggregate(collections.form_templates, [
    { $match: { _id: "mentor" } },
    { $unwind: { path: "$form" } },
    { $match: { "form.name": formName } },
    { $unwind: { path: "$form.options" } },
    {
      $match: {
        "form.options.value": form[formName],
      },
    },
    {
      $project: {
        _id: 0,
        label: "$form.options.label",
      },
    },
  ]);

  const TODAY = new Date().toISOString();

  const item = {
    fields: {
      Title: mentee.first_name + " " + mentee.last_name, // string ex. "John Doe"
      MentorsEmailaddress: mentor.email, // string ex. "mentor@mentor.ca"
      Areyoucurrentlymentoringanyone_x: capitalize(form.did_you), // tuple ex. "Yes" / "No" / "Not Applicable"
      NameofMentor: mentor.first_name + " " + mentor.last_name, // string ex. "John Doe"
      SubmissionDate: TODAY, // string ex. "2024-07-15T00:00:00Z"
      Whatdidyoudowithyourmentee_x003f: isMentorTalked
        ? formOption[0].label
        : NOT_APPLICABLE, // string ex. "Lesson 1"
      Datementortalkedwithmentee_x003a: isMentorTalked
        ? new Date(form.date_talked).toISOString()
        : TODAY, // string ex. "2024-07-15T00:00:00Z"
      Reasonfornotmentoringanyone: !isMentorTalked
        ? formOption[0].label
        : NOT_APPLICABLE, // string ex. "Graduated"
      From_x0020_App: true, // boolean ex. true / false
      Report_x0020_ID: reportId, // string ex. "1234"
    },
  };

  // Add the new list item in the SharePoint list and return the response
  return addNewListItem(
    newMuslimWeeklyTrackerSiteId,
    newMuslimWeeklyTrackerListId,
    item
  );
};

module.exports.getAccessToken = getAccessToken;
module.exports.addNewEntryStreetDawahList = addNewEntryStreetDawahList;
module.exports.addNewEntryNewMuslimWeeklyTrackerList =
  addNewEntryNewMuslimWeeklyTrackerList;
