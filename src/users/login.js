const Joi = require('joi')
const {insert, find, collections, deleteTempPassword} = require('../common/mongo')
const lambdaReponse = require('../common/lambdaResponse').lambdaReponse
const COLLECTION = mongodb.collections
const bcrypt = require('bcryptjs');
const Boom = require('boom')
const cryptoRandomString = require('crypto-random-string');
const setTempPassword = require('../common/setTempPassword').setTempPassword
const { v4: uuidv4, v5: uuidv5 } = require('uuid');

module.exports.handler = async (event) => {
    const body = JSON.parse(event.body)
    const email = body.email
    const password = body.password
    const query = {_id:email}

    if(email && email !== ''){
        if(password){
            const passwordHash = bcrypt.hashSync(body.password, 10)
            const users_password = await find(collections.tmp_password, {_id:email, password:passwordHash})
            if(users_password.length > 0){
                
                deleteTempPassword(email)
                const users = await find(collections.users, {email:uuidv5(email, uuidv5.URL)})
                if(users.length > 0){
                    const user = users[0]
                    const token = jwt.sign(user, process.env.JWT_PRIVATE, { expiresIn: 60*60*24*365, algorithm: 'RS256' });
                    return lambdaReponse({...users[0], token})
                }
                
            }
        }else{
            await setTempPassword(query)
            return lambdaReponse({msg:"Email sent"})
        }
    }
    return lambdaReponse(Boom.unauthorized())
    
  };
  