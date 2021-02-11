const TrackedUser = require('../models/TrackedUserModel');
const User = require('../models/UserModel');
const {fetchSingleProfile} = require('./steam');
const {sendHook} = require("./discord");

module.exports = {
    checkAllUsers: async() =>{
        const users = await TrackedUser.find({discordSent: false});
        //can be optimized
        console.log(`Checking ${users.length} tracked users`);
        for(u of users){
            fetchSingleProfile(u.steamid64)
            .then((res)=>{
                if(res.VACBanned){
                    User.findOne({steamid64:u.observerId64})
                    .then((observer)=>{
                        if(observer.sendDiscord){
                            console.log(`User ${res.personaname} got banned, sending webhook to ${observer.steamid64}`)
                            sendHook(observer.discordHook,res)
                            .then((resp)=>{
                                if(resp.status === 200){
                                    const query = {steamid64: res.steamid64};
                                    const params = {discordSent: true};
                                    TrackedUser.findOneAndUpdate(query, params, {new: true}, (err,doc)=>{
                                        if(err || !doc){
                                            console.log('Error while trying to update tracked user')
                                            return;
                                        }
                                        return;
                                    })
                                }else{
                                    console.log('Error with webhook: ' + resp.error);
                                    return;
                                }
                            })
                        }else{
                            return;
                        }
                    });
                }
                return;
            })
        }
    }
}

