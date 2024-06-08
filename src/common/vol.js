const lodash = require("lodash");
const headings = [
  "pin",
  "name",
  "status",
  "tl1",
  "tl2",
  "gender",
  "team",
  "role",
  "manager",
  "location",
  "mobile",
  "email",
  "email_tow",
  "address",
  "province",
  "postal_code",
  "duediligence",
  "comments",
  "conflict_of_interest",
  "criminal_delclaration",
  "gdpr",
  "extrimist_policy",
  "iera_agreement",
  "id",
  "contact_necessary",
];
const data = require("./vol.json");
let vols = [];
for (let volunteer of data) {
  let vol = {};
  for (let heading in headings) {
    vol[headings[heading]] = lodash.trim(volunteer[heading]);
  }
  vols.push(vol);
}
const fs = require("fs");
fs.writeFileSync("./volunteer.json", JSON.stringify(vols, null, 2));
