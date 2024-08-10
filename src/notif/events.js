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
const moment = require("moment");
const { groupBy, startCase } = require("lodash");
const minEvents = 2;
const templateId = "d-9d0e2795ec3e4a14b610e5e45891fdf3";
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENGRID);
const templates = require("../common/emailTemplates");
//templates.token.template_id = templateId;
module.exports.handler = async (event) => {
  const startMonth = 0;
  const gt = moment().startOf("month").add(startMonth, "month").toDate();
  const lte = moment().startOf("month").add(2, "month").toDate();
  const start = { $gt: gt, $lte: lte };
  console.log({ start });
  const events = await find(collections.sub_events, {
    status: "active",
    start,
  });
  const events_grouped = groupBy(events, "teamId");
  const volunteers = await find(collections.users, {
    status: "approved",
    admins: { $exists: true, $ne: [] },
  });
  const teams = await find(collections.teams, {
    parent_team: "daee",
    status: "approved",
  });
  const template = { ...templates.token };
  template.template_id = templateId;
  const to = template.personalizations[0];
  template.personalizations = [];
  teams.map((team) => {
    team.events = events_grouped[team._id]?.length;
    team.admins = volunteers.filter((volunteer) =>
      volunteer.admins.includes(team._id)
    );
    if (team.events < minEvents) {
      let tmp = { ...to };
      tmp.to = [];
      tmp.cc = [{ email: "volunteer.manager@iera.ca" }];

      for (let admin of team.admins) {
        tmp.to.push({ email: admin.email });
        tmp.dynamic_template_data.team = startCase(team._id);
        tmp.dynamic_template_data.month = moment()
          .startOf("month")
          .add(startMonth, "month")
          .format("MMMM YYYY");
      }
      template.personalizations.push(tmp);
    }
  });

  try {
    await sgMail.send(template);
  } catch (e) {
    console.log(e);
  }

  return lambdaReponse({ teams });
};
