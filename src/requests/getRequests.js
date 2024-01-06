const Joi = require('joi')
const lambdaReponse = require('../common/lambdaResponse').lambdaReponse

module.exports.handler = async (event) => {
    const type = event.queryStringParameters?event.queryStringParameters.type:null
    const requests = await getPendingRequest(type)
    return lambdaReponse(requests)
};
  