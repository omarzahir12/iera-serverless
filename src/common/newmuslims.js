const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const newMuslims = require("./newmuslims_orig.json");
const lodash = require("lodash");
let toSave = [];
const fs = require("fs");
for (let newMuslim of newMuslims) {
  newMuslim._id = uuidv5(lodash.trim(newMuslim.email), uuidv5.URL);
  if (lodash.trim(newMuslim.email) !== "") {
    toSave.push(newMuslim);
  }
}
fs.writeFileSync("./newmuslims.json", JSON.stringify(toSave, null, 2));
