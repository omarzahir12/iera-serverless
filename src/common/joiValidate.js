const Joi = require('joi').extend(require('joi-jwt'));
const getContext = require('./getContext')
const lambdaResponse = require('./lambdaResponse')

const joiValidate = (obj, validator, context, cb, options, locale) => {
  if (!locale) {
    locale = 'en'
  }
  const result = Joi.validate(obj, validator, options)
  if (typeof obj !== 'object' || result.error) {
    let errorCode = 400
    let msg = "Invalid Request"
    let details = result.error.details
    let errors = {}
    for (let a in details) {
      if (details[a].type === 'jwt.expired') {
        errorCode = 400
        msg = "Token expired"
      }
      if (details[a].context && details[a].context.key) {
        errors[details[a].context.key] = details[a].message
      }
    }
    cb(lambdaResponse({
      msg,
      errors
    }, errorCode))
    
  } else {
    cb(result.value)
  }
}
module.exports = joiValidate