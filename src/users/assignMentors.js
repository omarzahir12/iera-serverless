const { collections, push, pull } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const Boom = require("boom");

const { isLoggedIn } = require("../common/auth");

module.exports.handler = async (event) => {
  const jwt = await isLoggedIn(event, true);
  if (jwt.type !== "superadmin") return lambdaReponse(Boom.unauthorized());
  const body = event.body ? JSON.parse(event.body) : {};
  const mentors = body?.mentors || [];
  const old_mentors = body?.old_mentors || [];
  // Find items that are in both lists
  const commonItems = mentors.filter((mentor) => old_mentors.includes(mentor));

  // Find items that are only in mentors
  const to_add = mentors.filter((mentor) => !old_mentors.includes(mentor));

  // Find items that are only in old_mentors
  const to_remove = old_mentors.filter(
    (oldMentor) => !mentors.includes(oldMentor)
  );

  const menteeId = event.pathParameters.user_id;
  console.log({ mentors, menteeId, body: body });
  for (let mentor of to_add) {
    await push(
      collections.users,
      { _id: mentor },
      { mentees: menteeId },
      false
    );
  }
  for (let mentor of to_remove) {
    await pull(
      collections.users,
      { _id: mentor },
      { mentees: menteeId },
      false
    );
  }
  //TODO: send email to new muslim stating they have a Mentor they can reach out to
  return lambdaReponse({ _id: menteeId }, 201);
};
