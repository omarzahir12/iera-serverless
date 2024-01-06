const cryptoRandomString = require('crypto-random-string');
const {insert, collections, find, push, update} = require('../common/mongo')
const bcrypt = require('bcryptjs');
const { v4: uuidv4, v5: uuidv5 } = require('uuid');

const addUserToTeamRequest = async (team, user)=>{
  await insert(collections.requests, {_id:uuidv4(), type:"team", id:team, user, created_on:new Date(), status:"pending"})
}
const getPendingRequest = async (type)=>{
  const request = await find(collections.requests, type?{type, status:'pending'}:{status:'pending'})
  return request
}
const approveRequest = async (_id)=>{
  await update(collections.requests, {_id}, {status:"approved"}, false)
  const requests =  await find(collections.requests, {_id})
  if(requests.length > 0){
    const request = requests[0]
    if(request.type === "team"){
      addUserToTeam(request.id, request.user, request.created_on)
    }
  }
}
const addUserToTeam = async (team, user, created_on) => {
  const teams = await find(collections.teams, {_id:team})
  if(teams.length>0){
    const team = teams[0]
    if(team.members){
      let found = false
      for(member of team.members){
        if(member.user === user){
          found = true
        }
      }
      if(!found){
        await push(collections.teams, {_id:team}, {members:{user, status:'pending', created_on}})
      }
    }
  }

}
module.exports.addUserToTeam = addUserToTeam
module.exports.approveRequest = approveRequest
module.exports.getPendingRequest = getPendingRequest
module.exports.addUserToTeamRequest = addUserToTeamRequest
  