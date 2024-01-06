

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url=process.env.MONGO_URI
const db = 'iera_db'
let dbConnection
const CONFIG = 'config'
const getCollection = async (collection)=>{
    if(dbConnection){
        return dbConnection.collection(collection)
    }else{
        const client = new MongoClient(url, {});
        await client.connect()
        
        dbConnection = client.db(db);
        return dbConnection.collection(collection)
        
    }
};

module.exports.getCollection = getCollection

const find = async (collection, query, filter, limit, skip, sort, count)=>{
    let options = {}
    if(limit){
        options.limit = limit
    }
    if(skip){
        options.skip = skip
    }
    if(filter){
        options.projection = filter
    }
    if(sort){
        options.sort = sort
    }
    if(query['$text']){
        options.score = {$meta: "textScore"}
        if(sort){
            options.sort = {score:{$meta: "textScore"}}
            for(let a in sort){
                options.sort[a] = sort[a]
            }
        }
    }
    //console.log('query', JSON.stringify({collection, query, options}))

    let col = await getCollection(collection)
    let result = await col.find(query, options)
    if(count){
        let count = await result.count()
        return {result: await result.toArray(), count}
    }else{
        return result.toArray()
    }
    
}

const getConfig = async ()=>{
    const query = {}
    return await find(CONFIG, query)
}
module.exports.find = find
module.exports.getConfig = getConfig

const update = async (collection, query, set, upsert)=>{
    let col = await getCollection(collection)
    return await col.findOneAndUpdate(query, {$set:set}, { returnOriginal: false, upsert })
}
const deleteTempPassword = async (_id)=>{
    let col = await getCollection(this.collections.tmp_password)
    return await col.deleteManu({_id})
}
module.exports.deleteTempPassword = deleteTempPassword

const push = async (collection, query, push, upsert)=>{
    let col = await getCollection(collection)
    return await col.findOneAndUpdate(query, {$push:push}, { returnOriginal: false, upsert })
}
module.exports.update = update
module.exports.push = push

const insert = async (collection, query, set, upsert)=>{
    let col = await getCollection(collection)
    //return await col.insert(query)
    if(upsert && query._id){
        update(collection, {_id:query._id}, query, true)
    }else{
        if(query.length === undefined)
            return await col.insertOne(query)
        else if(query.length === 1)
            return await col.insertOne(query[0])
        else if(query.lengh > 1)
            return await col.insertMany(query,{ ordered: false })
    }
    
}
module.exports.insert = insert
module.exports.collections = {
    users:'iera_users',
    events:'iera_events',
    teams:'iera_teams',
    requests:'iera_requests',
    tmp_password:'iera_users_password'
}
module.exports.ObjectId = ObjectId