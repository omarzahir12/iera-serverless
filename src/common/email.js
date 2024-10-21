const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
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
module.exports.sendMenteeAcceptance = async (menteeEmail, menteeName, mentorDetails, menteeGender) => {
  const template = { ...templates.menteeAcceptance };
  template.personalizations[0].to[0].email = menteeEmail;
  template.personalizations[0].dynamic_template_data = {
    menteename: menteeName,
    mentordetails: mentorDetails,
  };
  const filePath_handbook = path.join(__dirname, 'New Muslim Success HandBook.pdf');
  console.log(filePath_handbook);
  const fileData_handbook = fs.readFileSync(filePath_handbook).toString('base64');
  console.log(menteeGender);
  const filePath_qrc = (menteeGender === "male" ? path.join(__dirname, 'NM_Brothers_QRC_Whatsapp.jpg') : path.join(__dirname, 'NM_Sisters_QRC_Whatsapp.jpg'));
  console.log(filePath_qrc);
  const fileData_qrc = fs.readFileSync(filePath_qrc).toString('base64');
  template.attachments = [
    {
      content: fileData_handbook,
      filename: "New Muslim Success HandBook.pdf",
      type: "application/pdf",
      disposition: "attachment",
    },
    {
      content: fileData_qrc,
      filename: "Whatsapp_Group_QRCode.pdf",
      type: "image/jpeg",
      disposition: "attachment",
    },
  ];
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
// module.exports.sendWelcomeNewMuslim = async (newMuslimEmail, newMuslimName) => {
//   const template = { ...templates.welcomeNewMuslim };
//   template.personalizations[0].to[0].email = newMuslimEmail;
//   template.personalizations[0].dynamic_template_data = {
//     newMuslimName: newMuslimName,
//   };
//   await sgMail.send(template);
// };