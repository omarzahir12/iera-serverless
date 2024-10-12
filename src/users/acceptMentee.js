const { find, collections, update, push } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const { sendMenteeAcceptance } = require("../common/email");
const { v4: uuidv4 } = require('uuid');

const { isLoggedIn } = require("../common/auth");

module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event, true);
  if (!jwt || jwt.type === "superadmin")
    return lambdaReponse(Boom.unauthorized());

  const menteeId = event.pathParameters.user_id;
  if (!jwt.accepted_mentees || jwt.accepted_mentees.indexOf(menteeId) === -1) {
    await push(
      collections.users,
      { _id: jwt._id },
      { accepted_mentees: menteeId },
      false
    );
    await push(
      collections.reports,
      { _id: menteeId, type: "mentor" },
      {
        reports: {
          id: uuidv4(),
          meta: "Mentor",
          created_at: new Date(),
          mentor_id: jwt._id,
          status: "pending",
          submit: null,
          user: {
            _id: jwt._id,
            first_name: jwt.first_name,
            last_name: jwt.last_name,
          },
        },
      },
      true
    );
    
    //Get Mentee object
    const mentee = (await find(collections.users, { _id: menteeId }))[0];
    if (!mentee) return lambdaReponse(Boom.notFound("Mentor not found"));

    //Collect Mentor Details
    const mentorDetails = `
    Name: ${jwt.first_name} ${jwt.last_name}<br>
    Email: ${jwt.email}<br>
    Phone: ${jwt.phone || 'Not provided'}<br>
    City: ${jwt.city || 'Not provided'}<br>
    Gender: ${jwt.gender || 'Not provided'}<br>
    `.trim();
    
    //Send Email
    await sendMenteeAcceptance(
      mentee.email,
      mentee.first_name,
      mentorDetails,
    );
  }
  //TODO: send email to new muslim stating they have a Mentor they can reach out to
  return lambdaReponse({ _id: menteeId }, 201);
};
