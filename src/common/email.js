const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENGRID);
const templates = require("./emailTemplates");
module.exports.sendToken = async (token, to) => {
  const template = { ...templates.token };
  template.personalizations[0].to[0].email = to;
  template.personalizations[0].dynamic_template_data.code = token;
  await sgMail.send(template);
};
