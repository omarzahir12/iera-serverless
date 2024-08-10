const { update, collections, find } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;

const { getAccessToken } = require("../common/microsoft");

const microsoftAccessTokenId = process.env.MICROSOFT_ACCESS_TOKEN_ID;

/**
 * Get the Microsoft Access Token from the database
 * @returns {Promise<{body: string, statusCode: number}>}
 */
const getMicrosoftAccessToken = async () => {
  const tokens = await find(collections.tokens, {
    _id: microsoftAccessTokenId,
  });

  if (tokens.length === 0 || tokens[0].expiresAt < new Date()) {
    return null;
  }

  const expiresAt = new Date(tokens[0].expiresAt);
  if (expiresAt < new Date()) {
    const accessToken = await setMicrosoftAccessToken();
    return accessToken;
  }

  return tokens[0].accessToken;
};

/**
 * Set the Microsoft Access Token in the database
 * @returns {Promise<{body: string, statusCode: number}>}
 */
const setMicrosoftAccessToken = async () => {
  const response = await getAccessToken();

  if (!response?.access_token) {
    return lambdaReponse({ message: "No access token found" }, 500);
  }

  await update(
    collections.tokens,
    { _id: microsoftAccessTokenId },
    {
      accessToken: response.access_token,
      expiresAt: new Date(Date.now() + response.expires_in * 1000),
    },
    true
  );

  return response.access_token;
};

const handleMicrosoftToken = async (event) => {
  try {
    const response = await setMicrosoftAccessToken();
    return response;
  } catch (err) {
    console.error("Error to set Microsoft Access Token", err);
    return lambdaReponse(
      { message: "Error to set Microsoft Access Token" },
      500
    );
  }
};

module.exports.getMicrosoftAccessToken = getMicrosoftAccessToken;
module.exports.setMicrosoftAccessToken = setMicrosoftAccessToken;
module.exports.handleMicrosoftToken = handleMicrosoftToken;
