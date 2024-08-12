const Joi = require("joi");
const { insert, find, collections } = require("../common/mongo");
const lambdaReponse = require("../common/lambdaResponse").lambdaReponse;
const bcrypt = require("bcryptjs");
const Boom = require("boom");
const { setTempPassword } = require("../common/setTempPassword");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const jwt = require("jsonwebtoken");
const { isLoggedIn } = require("../common/auth");

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const email = body.email.toLowerCase();
  const password = body.password;
  const type =
    body.type && body.type === "newmuslim" ? "newmuslim" : "volunteer";
  const _id = uuidv5(email, uuidv5.URL);

  const query = { _id };
  console.log("Login", { email, password });
  if (email && email !== "") {
    const users = await find(collections.users, {
      _id,
    });
    let user;
    if (users.length > 0) {
      user = users[0];
    }
    if (!user) {
      user = {
        _id,
        type,
        email,
        created_on: new Date(),
        updated_on: new Date(),
      };
      await insert(collections.users, user);
    }
    if (password) {
      if (uuidv5(password, uuidv5.URL) === user.password) {
        const token = jwt.sign(user, process.env.PRIVATE_KEY, {
          expiresIn: 60 * 60 * 24 * 365,
          algorithm: "RS256",
          audience: "iera.ca",
        });
        return lambdaReponse({ user, token });
      }
    } else {
      await setTempPassword(query, email);
      return lambdaReponse({ msg: "Email sent" });
    }
  }
  return lambdaReponse(Boom.unauthorized());
};
module.exports.auth = async (event) => {
  console.log("auth");
  try {
    const jwt = await isLoggedIn(event);
    if (!jwt) return lambdaReponse(Boom.unauthorized());
    const users = await find(collections.users, {
      _id: jwt._id,
    });
    let user;
    if (users.length > 0) {
      user = users[0];
      return lambdaReponse(user);
    } else {
      return lambdaReponse(Boom.unauthorized());
    }
  } catch (e) {
    return lambdaReponse(Boom.unauthorized());
  }
};
