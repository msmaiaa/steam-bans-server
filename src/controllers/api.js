const User = require('../models/UserModel');
const ObservedUser = require('../models/ObservedUserModel');
const steam = require("../utils/steam");
const verify = require("../utils/token");
const buildQueryParams = require("../utils/query");

module.exports = {
    createUser: async (req,res) =>{
        try{
            const token = req.get('Authorization');
            const decoded = verify(token);
            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const hasUser = await User.findOne({steamid64: decoded.steamid}).exec();
            if(hasUser) return res.status(300).json({message:'User already exists'});
                
            const newUser = new User({
                steamid64: decoded.steamid,
                sendEmail: false,
                sendDiscord: false,
                email: '',
                discordHook: ''
            })
            await newUser.save();
            return res.status(200).json({message:'User created successfully'});
        }catch(err){
            return res.status(404).json({message:'Error while trying to create user', error: err})
        }
    },
    createObservedUser: async(req,res) =>{
        try{
            const token = req.get('Authorization');
            const decoded = verify(token);
            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const hasObsUser = await ObservedUser.findOne({observerId64: decoded.steamid, steamid64: req.body.steamid64}).exec();
            if (hasObsUser) return res.status(409).json({message:'Already observing the given steamid'});
    
            const newObsUser = new ObservedUser({
                observerId64: decoded.steamid,
                steamid64: req.body.steamid64
            })
            newObsUser.save((err,doc)=>{
                if (err) return res.status(404).json({message:'Error while trying to create a new observed user'})
                return res.status(200).json({message:'Observed user created successfully'});
            }); 
        }catch(err){
            console.log(err);
            return res.status(404).json({message:'Error while trying to create a new observed user', error: err});
        }
  
    },
    getObservedUsersList: async (req,res) =>{
        try{
            const token = req.get('Authorization');
            const decoded = verify(token);
    
            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const docs = await ObservedUser.find({observerId64: decoded.steamid})
            if(!docs){
                return res.status(500).json({message: 'Error fetching observed users list'});
            }else if(!docs.length >= 1){
                return res.status(404).json({message:'Couldnt find any observed users'});
            }else{
                const profiles = await steam.fetchProfiles(docs);
                return res.status(200).json({message: 'Observed users fetched successfully', docs: profiles});
            }
        }catch(err){
            // return res.status(404).json({message: 'Error fetching observed users list', error: err});
            return;
        }

    },
    checkObservedUser: async(req,res) =>{
        try{
            const token = req.get('Authorization');
            const decoded = verify(token);
    
            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const docs = await ObservedUser.find({observerId64: decoded.steamid, steamid64: req.body.steamid64})
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
            const token = req.get('Authorization');
            const decoded = verify(token);
            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }
            const query = {steamid: decoded.steamid};
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
    deleteObservedUser: async (req,res) =>{
        try{
            const token = req.get('Authorization');
            const decoded = verify(token);
    
            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'});
            }else if(!req.body.steamid64){
                return res.status(400).json({message: 'steamid64 not found'});
            }
            ObservedUser.deleteOne({observerId64: decoded.steamid, steamid64: req.body.steamid64}, null, (err) =>{
                if(err) return res.status(500).json({message: 'Error while trying to remove the user from the database'});
                return res.status(200).json({message: 'Observed user removed successfully'});
            })
        }catch(err){
            return res.status(404).json({message: 'Error while trying to delete a user', error: err});
        }
    }
}

