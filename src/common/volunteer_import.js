const volunteers = require("./volunteer_3c.json");
const { find, update, collections } = require("./mongo");
const { lambdaReponse } = require("./lambdaResponse");
const { Boom } = require("boom");

module.exports.handler = async (event) => {
  let processed = [];
  for (let volunteer of volunteers) {
    const vol = await find(collections.users, { _id: volunteer._id });
    if (vol.length === 0) {
      processed.push(volunteer);
      await update(collections.users, { _id: volunteer._id }, volunteer, true);
    } else {
      await update(
        collections.users,
        { _id: volunteer._id },
        { created_on: volunteer.created_on, updated_on: volunteer.updated_on },
        false
      );
    }
  }
  return lambdaReponse({ processed });
};
