const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENGRID);
const templates = require("./emailTemplates");
module.exports.sendToken = async (token, to) => {
  const template = { ...templates.token };
  template.personalizations[0].to[0].email = to;
  template.personalizations[0].dynamic_template_data.code = token;
  await sgMail.send(template);
};
module.exports.sendWelcome = async (to) => {
  const template = { ...templates.welcome };
  template.personalizations[0].to[0].email = to;
  await sgMail.send(template);
};
module.exports.volApproval = async (to) => {
  const template = { ...templates.volApproval };
  template.personalizations[0].to[0].email = to;
  await sgMail.send(template);
};
module.exports.volRefused = async (to) => {
  const template = { ...templates.volRefused };
  template.personalizations[0].to[0].email = to;
  await sgMail.send(template);
};
module.exports.newMuslimAdded = async (data) => {
  const template = { ...templates.newMuslimAdded };
  template.personalizations[0].dynamic_template_data = data;
  await sgMail.send(template);
};
