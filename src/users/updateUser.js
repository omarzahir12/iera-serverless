const Joi = require('joi')
const {insert, find, collections, deleteTempPassword, update} = require('../common/mongo')
const lambdaReponse = require('../common/lambdaResponse').lambdaReponse
const COLLECTION = mongodb.collections
const bcrypt = require('bcryptjs');
const Boom = require('boom')
const cryptoRandomString = require('crypto-random-string');
const setTempPassword = require('../common/setTempPassword').setTempPassword
const { v4: uuidv4, v5: uuidv5 } = require('uuid');
const createUserValidator = {
    firstName: Joi.string().min(2),
    lastName: Joi.string().min(2),
    email: Joi.string().email({minDomainAtoms:2}),
    phone: Joi.string().required(),
    location:Joi.object(),
    social:Joi.array(),
    idsBase64:Joi.array(),
    position:Joi.string(),
    experience:Joi.string(),
    gender: Joi.string().valid("male", "female")
}
module.exports.handler = async (event) => {
    const userId = event.pathParameters.user_id
    const body = JSON.parse(event.body)
    const result = Joi.validate(body, createUserValidator)
    if (typeof obj !== 'object' || result.error) {
        return lambdaReponse(Boom.badRequest(result.error))
    }
    const user = result.value
    const usersFromDb = await find(collections.users, {_id:userId})
    if(!usersFromDb[0].position && user.position){
        await addUserToTeamRequest(user.position, userId)
    }
    await update(collections.teams, {_id:teamId}, user)

    return lambdaReponse({_id:teamId, ...team})
    
  };
  