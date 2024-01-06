const Joi = require('joi')
const {insert, find, collections, deleteTempPassword} = require('../common/mongo')
const lambdaReponse = require('../common/lambdaResponse').lambdaReponse
const COLLECTION = mongodb.collections
const bcrypt = require('bcryptjs');
const Boom = require('boom')
const cryptoRandomString = require('crypto-random-string');
const setTempPassword = require('../common/setTempPassword').setTempPassword
const { v4: uuidv4, v5: uuidv5 } = require('uuid');
const createEventValidator = {
    name: Joi.string().required(),
    description:Joi.string().required(),
    dates:Joi.array(),
    base64Image:Joi.string(),
    location: Joi.object(),
    status:Joi.string().valid('active', 'inactive').default('active')
}
module.exports.handler = async (event) => {
    const teamId = event.pathParameters.team_id
    const body = JSON.parse(event.body)
    const result = Joi.validate(body, createTeamValidator)
    if (typeof obj !== 'object' || result.error) {
        return lambdaReponse(Boom.badRequest(result.error))
    }
    const event = result.value
    event._id = uuidv4()
    event.teamId = teamId
    await insert(collections.events, event)

    return lambdaReponse(event)
    
  };
  