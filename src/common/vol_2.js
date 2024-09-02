const lodash = require("lodash");
const moment = require("moment");
const vol_q = require("./vol_2_question.json");
const questions = lodash.keyBy(vol_q, "name");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const team_datas = lodash.keyBy(require("./vol_sept2.json"), 11);
//console.log({ team_data });
const headings = [
  "id",
  "completed_on",
  "above_18",
  "first_name",
  "last_name",
  "gender",
  "age_range",
  "photo_url",
  "email",
  "mobile",
  "country",
  "province",
  "city",
  "how_iera",
  "social",
  "position",
  "experience",
  "skills_other",
  "dawah_training",
  "islamic_education",
  "islamic_education_institute",
  "volunteer_hours",
  "skills",
  "iera_mission",
  "iera_why",
  "criminal_convictions",
  "criminal_details",
  "benefit_from_iera",
  "benefit_from_iera_details",
  "offered_gifts",
  "offered_gifts_details",
  "other_conflicts",
  "other_conflicts_details",
  "confirmation_of_understanding_text",
  "approved",
  "pin",
  "status",
  "role",
  "teams",
  "manager",
  "email_2",
  "contact_necessary",
  "comments",
];
function toInteger(value) {
  return parseInt(value);
}
const default_values = {
  position: "get_volunteer",
  skills: "Other",
};
function fromLabelToValue(array, label, key) {
  //console.log({ array, label });
  let value = "";
  for (let a of array) {
    if (a.label === label) {
      value = a.value ? a.value : a.label;
    }
  }
  if (value === "") {
    if (default_values[key]) {
      console.log({ label });
      value = default_values[key];
    } else {
      value = label;
    }
  }
  return value;
}
function toArray(value, key, a_key) {
  //console.log({ value, key });
  try {
    return JSON.parse(value).map((v) => {
      return fromLabelToValue(
        questions[key].options,
        lodash.trim(v),
        a_key ? a_key : key
      );
    });
  } catch (e) {
    return [];
  }
}
let teams = {};
function toSkillsOther(value, key) {
  const rValue = toArray(value, key, "skills_other");
  return rValue.length > 0 ? lodash.last(rValue) : "";
  //console.log({ value, key });
}
function setStatus(value, team_data) {
  return team_data && lodash.trim(team_data[2]) === "Active"
    ? "approved"
    : "pending";
}
function setTeams(value, team_data) {
  return team_data && lodash.trim(team_data[6]) === "Active"
    ? "approved"
    : "pending";
}
const types = {
  id: toInteger,
  pin: toInteger,
  completed_on: moment,
  gender: lodash.lowerCase,
  position: toArray,
  skills: toArray,
  skills_other: toSkillsOther,
  email: lodash.toLower,
};
const data = require("./vol_2_sept2.json");
let vols = [];
for (let volunteer of data) {
  const team_data = null; //team_datas[volunteer[8]];
  //console.log({ team_data });
  let vol = {
    type: "volunteer",
    groups: ["volunteer"],
    created_on: new Date(volunteer[1]),
    updated_on: new Date(volunteer[1]),
  };
  for (let heading in headings) {
    vol[headings[heading]] = types[headings[heading]]
      ? types[headings[heading]](volunteer[heading], headings[heading])
      : lodash.trim(volunteer[heading]);
    if (
      headings[heading] === "skills" &&
      vol[headings[heading]].indexOf("Other") > -1
    ) {
      //console.log("got other");
      vol["skills_other"] = types["skills_other"]
        ? types["skills_other"](volunteer[heading], headings[heading])
        : lodash.trim(volunteer[heading]);
    } else if (headings[heading] === "email") {
      const e = vol["email"].toLowerCase();
      console.log({ e, email: vol["email"] });
      vol["_id"] = uuidv5(vol["email"], uuidv5.URL);
    } else if (headings[heading] === "status") {
      //vol["status"] = setStatus(vol["status"], team_data);
    } else if (headings[heading] === "teams") {
      if (vol["teams"] === "") {
        vol["teams"] = [];
      }
      //vol["teams"] = setStatus(vol["status"], team_data);
    } else if (headings[heading] === "comments") {
      if (team_data && lodash.trim(team_data[7])) {
        const user_info = {
          sub_group:
            lodash.trim(team_data[7]) === "New Muslm Mentor"
              ? ["mentor"]
              : ["daee"],
          teams: [lodash.snakeCase(lodash.trim(team_data[6]))],
        };

        if (
          lodash.trim(team_data[7]).indexOf("Lead") > -1 ||
          lodash.trim(team_data[7]).indexOf("Deputy") > -1
        ) {
          user_info["admins"] = user_info.teams;
        }
        teams[user_info.teams[0]] = user_info.teams[0]
          ? { _id: user_info.teams[0], status: "approved", parent_team: "daee" }
          : null;
        //console.log({ team_data });
        vol = { ...vol, ...user_info };
      }
    }
  }
  vols.push(vol);
}
console.log({ teams: Object.values(teams) });
const fs = require("fs");
fs.writeFileSync("./volunteer_3c.json", JSON.stringify(vols, null, 2));
