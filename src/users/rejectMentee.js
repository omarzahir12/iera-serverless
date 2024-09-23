const { collections, update, push, pull } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");

const { isLoggedIn } = require("../common/auth");

module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event, true);
  if (!jwt || jwt.type === "superadmin")
    return lambdaReponse(Boom.unauthorized());

  const menteeId = event.pathParameters.user_id;
  if (!jwt.accepted_mentees || jwt.accepted_mentees.indexOf(menteeId) === -1) {
    await pull(
      collections.users,
      { _id: jwt._id },
      { mentees: menteeId },
      false
    );
  }
  //TODO: send email to admin stating Mentee has been rejected
  return lambdaReponse({ _id: menteeId }, 201);
};
