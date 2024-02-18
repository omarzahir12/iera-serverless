const { insert, collections, update } = require("../common/mongo");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const { sendToken } = require("./email");

function rand(n) {
  var add = 1,
    max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

  if (n > max) {
    return generate(max) + generate(n - max);
  }

  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
}
const setTempPassword = async (query, email) => {
  const secret = rand(6);
  console.log("SECRET", { email: query._id, secret });
  const password = uuidv5(secret, uuidv5.URL);
  await update(collections.users, query, { password });
  await sendToken(secret, email);
};

module.exports.setTempPassword = setTempPassword;
