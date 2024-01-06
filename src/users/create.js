const Joi = require('joi')
const {insert, find, collections, deleteTempPassword} = require('../common/mongo')
const lambdaReponse = require('../common/lambdaResponse').lambdaReponse
const bcrypt = require('bcryptjs');
const Boom = require('boom')
const cryptoRandomString = require('crypto-random-string');
const setTempPassword = require('../common/setTempPassword').setTempPassword
const { v4: uuidv4, v5: uuidv5 } = require('uuid');
const {addUserToTeamRequest} = require('../common/teams')
const createUserValidator = {
    firstName: Joi.string().min(2).required(),
    email: Joi.string().email({minDomainAtoms:2}).required(),
    phone: Joi.string().required(),
}
module.exports.handler = async (event) => {
    const body = JSON.parse(event.body)
    const result = Joi.validate(body, createUserValidator)
    if (typeof obj !== 'object' || result.error) {
        return lambdaReponse(Boom.badRequest(result.error))
    }
    const user = result.value
    user.status = 'pending'
    user._id = uuidv5(user.email, uuidv5.URL)
    
    const mresponse = await insert(collections.users, user)
    await setTempPassword({_id:user._id})
    return lambdaReponse(mresponse)
    
  };
  