const User = require('../models/UserModel');
const TrackedUser = require('../models/TrackedUserModel');
const steam = require("../utils/steam");
const verify = require("../utils/token");
const buildQueryParams = require("../utils/query");

module.exports = {
    createUser: async (req,res) =>{
        try{
            const decoded = verify(req.get('Authorization'));

            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const hasUser = await User.findOne({steamid64: decoded.steamid}).exec();
            if(hasUser) return res.status(300).json({message:'User already exists'});
                
            const newUser = new User({
                steamid64: decoded.steamid,
                sendDiscord: false,
                discordHook: ''
            })
            await newUser.save();
            return res.status(200).json({message:'User created successfully'});
        }catch(err){
            return res.status(404).json({message:'Error while trying to create user', error: err})
        }
    },
    getUserInfo: async(req,res) =>{
        try{
            const decoded = verify(req.get('Authorization'));

            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const user = await User.findOne({steamid64: decoded.steamid}).exec();
            if(!user) return res.status(300).json({message:'User doesnt exist'});
            return res.status(200).json({user: user});
        }catch(err){
            return res.status(404).json({message:'Error while trying get user info', error: err})
        }
    },
    createTrackedUser: async(req,res) =>{
        try{
            const decoded = verify(req.get('Authorization'));

            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const hasObsUser = await TrackedUser.findOne({observerId64: decoded.steamid, steamid64: req.body.steamid64}).exec();
            if (hasObsUser) return res.status(409).json({message:'Already observing the given steamid'});
    
            const newObsUser = new TrackedUser({
                observerId64: decoded.steamid,
                steamid64: req.body.steamid64,
                discordSent: false
            })
            newObsUser.save((err,doc)=>{
                if (err) return res.status(404).json({message:'Error while trying to create a new Tracked user'})
                return res.status(200).json({message:'Tracked user created successfully'});
            }); 
        }catch(err){
            console.log(err);
            return res.status(404).json({message:'Error while trying to create a new Tracked user', error: err});
        }
  
    },
    getTrackedUsersList: async (req,res) =>{
        try{
            const decoded = verify(req.get('Authorization'));
    
            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const docs = await TrackedUser.find({observerId64: decoded.steamid})
            if(!docs){
                return res.status(500).json({message: 'Error fetching Tracked users list'});
            }else if(!docs.length >= 1){
                return res.status(404).json({message:'Couldnt find any Tracked users'});
            }else{
                const profiles = await steam.fetchProfiles(docs);
                return res.status(200).json({message: 'Tracked users fetched successfully', docs: profiles});
            }
        }catch(err){
            // return res.status(404).json({message: 'Error fetching Tracked users list', error: err});
            return;
        }

    },
    checkTrackedUser: async(req,res) =>{
        try{
            const decoded = verify(req.get('Authorization'));
    
            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const docs = await TrackedUser.find({observerId64: decoded.steamid, steamid64: req.body.steamid64})
            if(docs.length >= 1){
                return res.status(200).send({isObserving: true})
            }else{
                return res.status(200).send({isObserving: false})
            }
        }catch(err){
            return res.status(404).json({message: 'Error while trying to check tracking status', error: err});
        }
    },
    fetchProfile: async (req,res) =>{
        if(!req.body.data){
            return res.status(422).send({message:'Invalid params'});
        }
        let profile = await steam.fetchSingleProfile(req.body.data);
        if(!profile.steamid64){
            return res.status(422).send({message:'Unable to find the given profile'});
        }
        return res.status(200).send({user: profile});   
    },
    updateUser: async (req,res) =>{
        try{
            const decoded = verify(req.get('Authorization'));

            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const query = {steamid64: decoded.steamid};
            const params = buildQueryParams(req.body);
    
            User.findOneAndUpdate(query, params, null, (err,doc)=>{
                if(err || !doc){
                    return res.status(404).json({message: 'Error while trying to update user'});
                }
                return res.status(200).json({message:'User updated successfully'});
            })
        }catch(err){
            return res.status(404).json({message: 'Error while trying to update user', error:err});
        }
    },
    deleteTrackedUser: async (req,res) =>{
        try{
            const decoded = verify(req.get('Authorization'));
    
            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'});
            }else if(!req.body.steamid64){
                return res.status(400).json({message: 'steamid64 not found'});
            }
            TrackedUser.deleteOne({observerId64: decoded.steamid, steamid64: req.body.steamid64}, null, (err) =>{
                if(err) return res.status(500).json({message: 'Error while trying to remove the user from the database'});
                return res.status(200).json({message: 'Tracked user removed successfully'});
            })
        }catch(err){
            return res.status(404).json({message: 'Error while trying to delete a user', error: err});
        }
    }
}

