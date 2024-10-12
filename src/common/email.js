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
module.exports.newVolunteerAdded = async (data) => {
  const template = { ...templates.newVolunteerAdded };
  template.personalizations[0].dynamic_template_data = data;
  await sgMail.send(template);
};
module.exports.sendMentorAssignment = async (mentorEmail, mentorName, menteeName, menteeDetails) => {
  const template = { ...templates.mentorAssignment };
  template.personalizations[0].to[0].email = mentorEmail;
  template.personalizations[0].dynamic_template_data = {
    mentorname: mentorName,
    menteename: menteeName,
    menteedetails: menteeDetails,
  };
  await sgMail.send(template);
};
module.exports.sendMenteeAcceptance = async (menteeEmail, mentorEmail, menteeName, mentorDetails) => {
  const template = { ...templates.menteeAcceptance };
  template.personalizations[0].to[0].email = menteeEmail;
  template.personalizations[0].cc[0].email = mentorEmail;
  template.personalizations[0].dynamic_template_data = {
    menteename: menteeName,
    mentordetails: mentorDetails,
  };
  await sgMail.send(template);
};
module.exports.sendMenteeRejection = async (menteeDetails, mentorDetails, reason) => {
  const template = { ...templates.menteeRejection };
  template.personalizations[0].dynamic_template_data = {
    mentordetails: mentorDetails,
    menteedetails: menteeDetails,
    reason: reason, 
  };
  await sgMail.send(template);
};
module.exports.sendWelcomeNewMuslim = async (newMuslimEmail, newMuslimName) => {
  const template = { ...templates.welcomeNewMuslim };
  template.personalizations[0].to[0].email = newMuslimEmail;
  template.personalizations[0].dynamic_template_data = {
    newMuslimName: newMuslimName,
  };
  await sgMail.send(template);
};