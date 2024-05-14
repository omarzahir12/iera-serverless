const moment = require("moment");

function getDates(ddd, required, need) {
  const dd = moment(ddd);
  const today = moment();
  const diff_week = today.diff(dd, "weeks");
  const diff_day = today.diff(dd, "days");
  let dates = [];
  for (let a = 0; a < required; a++) {
    dates.push(
      dd
        .clone()
        .add(diff_week + a + (diff_day <= 0 ? 0 : 1), "weeks")
        .utc()
        .format()
    );
  }
  const to = dates.slice(required - need);
  console.log({ dd, diff_week, diff_day, dates, to });
  return to;
}
//getDates("2024-05-09T06:00:00.000Z", 10, 2);
module.exports.getDates = getDates;
