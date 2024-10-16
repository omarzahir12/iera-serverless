const { find, collections, push, pull } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");
const { sendMentorAssignment } = require("../common/email");

const { isLoggedIn } = require("../common/auth");

module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event, true);
  if (jwt.type !== "superadmin") return lambdaReponse(Boom.unauthorized());
  const body = event.body ? JSON.parse(event.body) : {};
  const mentors = body?.mentors || [];
  const old_mentors = body?.orig_mentors || [];
  // Find items that are in both lists
  const commonItems = mentors.filter((mentor) => old_mentors.includes(mentor));

  // Find items that are only in mentors
  const to_add = mentors.filter((mentor) => !old_mentors.includes(mentor));

  // Find items that are only in old_mentors
  const to_remove = old_mentors.filter(
    (oldMentor) => !mentors.includes(oldMentor)
  );
  console.log({ mentors, old_mentors, to_add, to_remove });
  const menteeId = event.pathParameters.user_id;
  console.log({ mentors, menteeId, body: body });
  
  //Get Mentee details
  const mentee = (await find(collections.users, { _id: menteeId }))[0];
  
  for (let mentorId of to_add) {
    //Add to Database
    await push(
      collections.users,
      { _id: mentorId },
      { mentees: menteeId },
      false
    );

    //Get Mentor details
    const mentor = (await find(collections.users, { _id: mentorId }))[0];
    
    //Obtain Mentee Details
    const menteeDetails = `
    Name: ${mentee.first_name} ${mentee.last_name}<br>
    Email: ${mentee.email}<br>
    Phone: ${mentee.phone || 'Not provided'}<br>
    Location: ${mentee.location || 'Not provided'}<br>
    Previous Religion: ${mentee.previous_religion || 'Not provided'}<br>
    `.trim();
    
    //Send Email
    await sendMentorAssignment(
      mentor.email,
      mentor.first_name,
      `${mentee.first_name} ${mentee.last_name}`,
      menteeDetails,
    );
  }
  for (let mentorId of to_remove) {
    await pull(
      collections.users,
      { _id: mentorId },
      { mentees: menteeId },
      false
    );
  }
  //TODO: send email to new muslim stating they have a Mentor they can reach out to
  return lambdaReponse({ _id: menteeId }, 201);
};
