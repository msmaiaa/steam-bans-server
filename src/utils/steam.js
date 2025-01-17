const axios = require('axios');
var SteamID = require('steamid');

let statusUrl = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${process.env.STEAM_API_KEY}&steamids=`;
let profileUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=`;
let customUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=`;

const fetchProfiles = async(docs) =>{
    let newStatusUrl = statusUrl;
    let newProfileUrl = profileUrl;
    for(d of docs){
        newStatusUrl += d.steamid64 + ',';
        newProfileUrl += d.steamid64 + ',';
    }
    const statusResult = await axios.get(newStatusUrl);
    const profilesResult = await axios.get(newProfileUrl);
    let allProfiles = profilesResult.data.response.players;
    let allStatus = statusResult.data.players;

    for(i = 0; i < allProfiles.length; i++){
        for(j = 0; j < allStatus.length; j++){
            if(allProfiles[i].steamid == allStatus[j].SteamId){
                Object.assign(allProfiles[i], allStatus[j]);
                allProfiles[i].steamid64 = allProfiles[i].steamid;
                let steamIds = await regexSteam(allProfiles[i].steamid64);
                delete allStatus[j].SteamId;
                delete allProfiles[i].steamid;
                delete allProfiles[i].steamid64;
                Object.assign(allProfiles[i], steamIds);
                break
            }
        }
    }
    return allProfiles;
}

const fetchSingleProfile = async(steam) =>{
    let profile = {};
    const steamIds = await regexSteam(steam);
    const statusResult = await axios.get(statusUrl + steamIds.steamid64);
    const profilesResult = await axios.get(profileUrl + steamIds.steamid64);

    Object.assign(profile, profilesResult.data.response.players[0]);
    Object.assign(profile, statusResult.data.players[0]);
    delete profile.steamid;
    delete profile.SteamId;
    Object.assign(profile, steamIds);

    return profile;
}

const regexSteam = async(steam) =>{
    let steamIds = {};

    let steamid3 = new RegExp('^U\\:\\d\\:\\d+$');
    let steamid = new RegExp('^STEAM_[0-5]:[01]:\\d+$');
    let steamUrl = new RegExp('(?:https?:\\/\\/)?steamcommunity\\.com\\/(?:profiles)\\/[a-zA-Z0-9]+');
    let customSteamUrl = new RegExp('(?:https?:\\/\\/)?steamcommunity\\.com\\/(?:id)\\/[a-zA-Z0-9]+');

    //need switch case
    if(steamUrl.test(steam)){
        steamIds = buildIdBody(steamIds.steamid64 = steam.split('/')[4], 'steamid64')
        
    }else if(customSteamUrl.test(steam)){
        let vanity = steam.split('/')[4]
        let vanityResult = await axios.get(customUrl + vanity);
        steamIds = buildIdBody(vanityResult.data.response.steamid, 'steamid64');

    }else if(steam.length == 17){
        let sid = new SteamID(steam);
        if(sid.isValid()){
            steamIds = buildIdBody(steam, 'steamid64')
        }else{
            steamIds = false;
        }

    }else if(steamid.test(steam)){
        const sid = new SteamID(steam);
        if(sid.isValid()){
            steamIds = buildIdBody(steam, 'steamid');
        }else{
            steamIds = false;
        }

    }else if(steamid3.test(steam)){
        const newSteamid3 = '[' + steam + ']';
        const sid = new SteamID(newSteamid3);
        if(sid.isValid()){
            steamIds = buildIdBody(newSteamid3, 'steamid3')
        }else{
            steamIds = false;
        }

    }else{
        steamIds = false;
    }
    return steamIds;
}

const buildIdBody = (id, type) =>{
    let steamIds = {};
    switch(type){
        case 'steamid64':{
            steamIds.steamid64 = id;
            let sid = new SteamID(id);
            steamIds.steamid3 = sid.getSteam3RenderedID();
            steamIds.steamid = sid.getSteam2RenderedID(true);
            return steamIds;
        }
        case 'steamid':{
            steamIds.steamid = id;
            let sid = new SteamID(steamIds.steamid);
            steamIds.steamid3 = sid.getSteam3RenderedID();
            steamIds.steamid64 = sid.getSteamID64();
            return steamIds;
        }
        case 'steamid3':{
            steamIds.steamid3 = id;
            let sid = new SteamID(steamIds.steamid3);
            steamIds.steamid = sid.getSteam2RenderedID(true);
            steamIds.steamid64 = sid.getSteamID64();
            return steamIds;
        }
    }
}

module.exports.fetchProfiles = fetchProfiles;
module.exports.fetchSingleProfile = fetchSingleProfile;
