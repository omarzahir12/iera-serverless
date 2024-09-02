const newMuslims = require("./nm_sept2_obj.json");
const newMuslimsTo = require("./nm_sept2_objdb.json");

const { find, update, collections } = require("./mongo");
const { lambdaReponse } = require("./lambdaResponse");
const Boom = require("boom");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const fs = require("fs");
function validateEmail(email) {
  return email.match(/^[\w-+\.]+@([\w-]+\.)+[\w-]{2,4}$/);
}
function formatPhoneNumber(phoneNumber) {
  let cleanNum = phoneNumber.toString().replace(/\D/g, "");
  if (cleanNum.length > 10) {
    cleanNum = cleanNum.substring(0, 10);
  }
  const match = cleanNum.match(/^(\d{3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    return (
      (match[2] ? "(" : "") +
      match[1] +
      (match[2] ? ") " : "") +
      (match[2] ? match[2] + (match[3] ? "-" : "") : "") +
      match[3]
    );
  }
  return cleanNum;
}
module.exports.handler = async (event) => {
  let processed = [];
  let processed_pre = [];
  let not_processed = [];
  let dup = [];
  for (let newMuslim of newMuslims) {
    const first_name = newMuslim["New Muslim's First Name"];
    const last_name = newMuslim["New Muslim's Last Name"];
    const email = newMuslim["New Muslim's Email"].trim();
    let nm = {
      id: newMuslim["ID"],
      type: "newmuslim",
      groups: ["newmuslim"],
      position: "newmuslim",
      status: "in_review",
      email: email.toLowerCase(),
      phone: formatPhoneNumber(newMuslim["New Muslim's Phone Number"].trim()),
      postal_code: "",
      first_name,
      last_name: last_name !== "" ? last_name : first_name.split(" ")[1],
      gender: newMuslim["New Muslim's Gender"].toLowerCase(),
      created_on: new Date(newMuslim["Start time"]),
      updated_on: new Date(newMuslim["Completion time"]),
      previous_religion: newMuslim["New Muslim's Previous Religion"],
      social_media_handle:
        newMuslim[
          "New Muslim's Social Media Handle (if we can contact them via social media)"
        ],
      shahada_location_old: newMuslim["Where did you take your shahada?"],
      referrer_name:
        newMuslim[
          "Name Of The One Referring New Muslim (i.e. name of the one submitting the form to refer a new Muslim)"
        ],
      referrer_email:
        newMuslim[
          "Email Of The One Referring New Muslim (i.e. name of the one submitting the form to refer a new Muslim)"
        ],
      country: newMuslim["New Muslim's Country"],
      province: newMuslim["New Muslim's Province"],
      city: newMuslim["New Muslim's City"],
      additional_info: newMuslim["Additional info About the New Muslim"],
    };
    nm._id = uuidv5(nm.email, uuidv5.URL);
    if (validateEmail(nm.email)) {
      const newm = await find(collections.users, { email: nm.email });
      console.log({ newm: newm.length, email: nm.email });
      if (email !== email.toLowerCase()) {
        const by_email = await find(collections.users, { email });
        if (newm.length === 0 && by_email.length === 0) {
          processed.push(nm);
        } else if (newm.length === 0) {
          dup.push({ nm, by_email: by_email.length, newm: newm.length });
        } else {
          processed_pre.push(nm);
        }
      } else if (newm.length === 0) {
        processed.push(nm);
      } else {
        processed_pre.push(nm);
      }
    } else {
      not_processed.push(nm);
    }
  }
  fs.writeFileSync(
    "./nm_sept2_objdb.json",
    JSON.stringify({ processed, processed_pre, not_processed, dup }, null, 2)
  );
  return lambdaReponse({ processed, processed_pre, not_processed, dup });
};

module.exports.update = async (event) => {
  const process = newMuslimsTo.processed;
  const fix = newMuslimsTo.processed_pre;
  for (let user of process) {
    try {
      await update(collections.users, { email: user.email }, user, true);
    } catch (e) {
      console.log({ e, user });
    }
  }
  for (let user of fix) {
    let u = JSON.parse(JSON.stringify(user));
    delete u._id;
    delete u.status;
    try {
      await update(collections.users, { email: user.email }, u, false);
    } catch (e) {
      console.log({ e, user });
    }
  }
  return lambdaReponse({});
};
