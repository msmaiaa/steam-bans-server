const webhook = require("webhook-discord")

const avatarUrl = 'https://wiki.teamfortress.com/w/images/thumb/d/dc/Banhammer.png/250px-Banhammer.png';

module.exports = {
    testHook: (url) =>{
        try{
            const hook = new webhook.Webhook(url);
            const msg = new webhook.MessageBuilder()
            .setAvatar(avatarUrl)
            .setName('steam-bans')
            .setColor('#357097')
            .setTitle('user x banned')
            hook.send(msg)
        }catch(err){
            throw new Error(err);
        }
    },
    sendHook: (url,user) =>{
        try{
            const hook = new webhook.Webhook(url)
            const msg = new webhook.MessageBuilder()
            .setTitle(`User ${user.personaname} is now banned on steam!`)
            .setAvatar(avatarUrl)
            .setName('steam-bans')
            .setColor('#357097')
            .setImage(user.avatarfull)
            .addField('Profile url: ', user.profileurl, true)
            .addField('VAC Banned: ', user.VACBanned.toString())
            .addField('Community Banned: ', user.CommunityBanned.toString())
    
            hook.send(msg)
            return {status: 200}
        }catch(err){
            return {status: 404}
        }
    }
}



