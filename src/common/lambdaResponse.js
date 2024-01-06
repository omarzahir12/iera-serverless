const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
  const formatResponse = (body, statusCode) => {
    if (body.isBoom) {
      return {
        statusCode:body.output.statusCode,
        headers,
        body: JSON.stringify(body.output.payload)
      }
    } else {
      return {
        statusCode: statusCode?statusCode:200,
        body: JSON.stringify(body, null, 2),
        headers
      }
    }
  
  }
  module.exports.lambdaReponse = formatResponse
  