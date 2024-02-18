const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};
//Investigate latter why cookie is not being set
const formatResponse = (body, statusCode) => {
  if (body.isBoom) {
    return {
      statusCode: body.output.statusCode,
      headers,
      body: JSON.stringify(body.output.payload),
    };
  } else {
    let h = { ...headers };
    if (body.token) {
      h["Set-Cookie"] = "iera_token=" + body.token;
    }
    return {
      statusCode: statusCode ? statusCode : 200,
      body: JSON.stringify(body, null, 2),
      headers,
    };
  }
};
module.exports.lambdaReponse = formatResponse;
