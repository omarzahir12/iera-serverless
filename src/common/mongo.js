const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const url = process.env.MONGO_URI;
const db = "iera_db";
let dbConnection;
const CONFIG = "config";
const getCollection = async (collection) => {
  if (dbConnection) {
    return dbConnection.collection(collection);
  } else {
    const client = new MongoClient(url, {});
    await client.connect();

    dbConnection = client.db(db);
    return dbConnection.collection(collection);
  }
};

module.exports.getCollection = getCollection;

const find = async (collection, query, filter, limit, skip, sort, count) => {
  let options = {};
  if (limit) {
    options.limit = limit;
  }
  if (skip) {
    options.skip = skip;
  }
  if (filter) {
    options.projection = filter;
  }
  if (sort) {
    options.sort = sort;
  }
  if (query["$text"]) {
    options.score = { $meta: "textScore" };
    if (sort) {
      options.sort = { score: { $meta: "textScore" } };
      for (let a in sort) {
        options.sort[a] = sort[a];
      }
    }
  }
  //console.log('query', JSON.stringify({collection, query, options}))

  let col = await getCollection(collection);
  let result = await col.find(query, options);
  if (count) {
    let count = await result.count();
    return { result: await result.toArray(), count };
  } else {
    return result.toArray();
  }
};

const getConfig = async () => {
  const query = {};
  return await find(CONFIG, query);
};
module.exports.find = find;
module.exports.getConfig = getConfig;

const aggregate = async (collection, pipeline) => {
  const col = await getCollection(collection);
  const result = await col.aggregate(pipeline);

  return result.toArray();
};

module.exports.aggregate = aggregate;

const update = async (collection, query, set, upsert) => {
  console.log({ collection, query, set: JSON.stringify(set), upsert });
  let col = await getCollection(collection);
  return await col.findOneAndUpdate(
    query,
    { $set: set },
    { returnOriginal: false, upsert }
  );
};
const updatenpush = async (collection, query, set, push, upsert) => {
  console.log({ collection, query, set: JSON.stringify(set), upsert });
  let col = await getCollection(collection);
  return await col.findOneAndUpdate(
    query,
    { $set: set, $push: push },
    { returnOriginal: false, upsert }
  );
};
const addToSet = async (collection, query, set) => {
  console.log({ collection, query, addToSet: JSON.stringify(set) });
  let col = await getCollection(collection);
  return await col.findOneAndUpdate(query, { $addToSet: set });
};
const removeFromSet = async (collection, query, set) => {
  console.log({ collection, query, pull: JSON.stringify(set) });
  let col = await getCollection(collection);
  return await col.findOneAndUpdate(query, { $pull: set });
};

const push = async (collection, query, push, upsert) => {
  let col = await getCollection(collection);
  return await col.findOneAndUpdate(
    query,
    { $push: push },
    { returnOriginal: false, upsert }
  );
};
module.exports.update = update;
module.exports.updatenpush = updatenpush;
module.exports.push = push;
module.exports.addToSet = addToSet;
module.exports.removeFromSet = removeFromSet;

const insert = async (collection, query, set, upsert) => {
  let col = await getCollection(collection);
  //return await col.insert(query)
  if (upsert && query._id) {
    update(collection, { _id: query._id }, query, true);
  } else {
    if (query.length === undefined) return await col.insertOne(query);
    else if (query.length === 1) return await col.insertOne(query[0]);
    else if (query.length > 1)
      return await col.insertMany(query, { ordered: false });
  }
};
module.exports.insert = insert;
module.exports.collections = {
  users: "iera_users",
  events: "iera_events",
  sub_events: "iera_sub_events",
  sub_events_attendance: "iera_sub_events_attendance",
  teams: "iera_teams",
  reports: "iera_reports",
  requests: "iera_requests",
  tmp_password: "iera_users_password",
  form_templates: "form_templates",
  exec: "iera_exec",
  tokens: "tokens",
};
module.exports.ObjectId = ObjectId;
