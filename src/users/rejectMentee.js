const { find, collections, update, push, pull } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const { sendMenteeRejection } = require("../common/email");

const { isLoggedIn } = require("../common/auth");

module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event, true);
  if (!jwt || jwt.type === "superadmin")
    return lambdaReponse(Boom.unauthorized());
  const menteeId = event.pathParameters.user_id;
  let body = JSON.parse(event.body);
  //Parse for string
  const reason = body?.reason;
  //const reason = event.body?.reason;
  if (!jwt.accepted_mentees || jwt.accepted_mentees.indexOf(menteeId) === -1) {
    await pull(
      collections.users,
      { _id: jwt._id },
      { mentees: menteeId },
      false
    );
  }
  if (reason) {
    console.log({ menteeId, reason });
    //Get Mentee object
    const mentee = (await find(collections.users, { _id: menteeId }))[0];

    //Collect Mentee Details
    const menteeDetails = `
    Name: ${mentee.first_name} ${mentee.last_name}<br>
    Email: ${mentee.email}<br>
    Phone: ${mentee.phone || 'Not provided'}<br>
    Location: ${mentee.location || 'Not provided'}<br>
    Previous Religion: ${mentee.previous_religion || 'Not provided'}<br>
    `.trim();

    //Collect Mentor Details
    const mentorDetails = `
    Name: ${jwt.first_name} ${jwt.last_name}<br>
    Email: ${jwt.email}<br>
    Phone: ${jwt.phone || 'Not provided'}<br>
    City: ${jwt.city || 'Not provided'}<br>
    `.trim();
    
    console.log("Sending email");

    //Send Email
    await sendMenteeRejection(
      menteeDetails,
      mentorDetails,
      reason,
    );

    console.log("Email sent");
  }
  //TODO: send email to admin stating Mentee has been rejected
  return lambdaReponse({ _id: menteeId }, 201);
};
