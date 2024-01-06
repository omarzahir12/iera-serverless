const Joi = require('joi')
const {insert, find, collections, deleteTempPassword} = require('../common/mongo')
const lambdaReponse = require('../common/lambdaResponse').lambdaReponse
const COLLECTION = mongodb.collections
const bcrypt = require('bcryptjs');
const Boom = require('boom')
const cryptoRandomString = require('crypto-random-string');
const setTempPassword = require('../common/setTempPassword').setTempPassword
const { v4: uuidv4, v5: uuidv5 } = require('uuid');
const {approveRequest} = require('../common/teams')

module.exports.handler = async (event) => {
    const requestId = event.pathParameters.request_id
    await approveRequest(requestId)
    return lambdaReponse({})
};
  