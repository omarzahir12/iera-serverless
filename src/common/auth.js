const jwt = require("jsonwebtoken");
const { insert, find, collections } = require("./mongo");

const parseCookie = (str) => {
  if (str)
    return str
      .split(";")
      .map((v) => v.split("="))
      .reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      }, {});
  else return {};
};
function getAuthToken(req) {
  const headers = req.headers;
  const cookie = parseCookie(headers.cookie);
  const authorization = headers.authorization; //.replace("Bearer ","")
  const cookie_token = cookie.iera_token;

  return cookie_token
    ? cookie_token
    : authorization
    ? authorization.replace("Bearer ", "")
    : null;
}
module.exports.isLoggedIn = async (req, fromDB) => {
  const token = getAuthToken(req);
  if (token) {
    const decoded = jwt.verify(token, process.env.PUBLIC_KEY, {
      algorithm: "RS256",
      audience: "iera.ca",
    });
    /*if (fromDB) {
      const users = await find(collections.users, { _id: decoded._id });
      console.log({ users });
      return users[0];
    }*/
    return decoded;
  } else {
    console.log("no token");
    return false;
  }
};
