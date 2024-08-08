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
const createTeamValidator = Joi.object({
  name: Joi.string().required(),
  parent_team: Joi.string().required(),
  status: Joi.string().valid("approved", "enrolled").default("approved"),
});
module.exports.handler = async (event) => {
  const teamId = event.pathParameters.team_id;
  const body = JSON.parse(event.body);
  const result = createTeamValidator.validate(body);
  if (result.error) {
    return lambdaReponse(Boom.badRequest(result.error));
  }
  const team = result.value;
  await update(collections.teams, { _id: teamId }, team);

  return lambdaReponse({ _id: teamId, ...team });
};
