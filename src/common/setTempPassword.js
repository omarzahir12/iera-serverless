const cryptoRandomString = require('crypto-random-string');
const {insert, collections} = require('../common/mongo')
const bcrypt = require('bcryptjs');

const setTempPassword = async (query) => {
  const secret = cryptoRandomString({length: 8, type: 'url-safe'})
  console.log({email:query._id, secret})
  const password = bcrypt.hashSync(secret)
  await insert(collections.tmp_password, query, {password}, true)

}
module.exports.setTempPassword = setTempPassword
  