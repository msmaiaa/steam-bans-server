const webhook = require("webhook-discord")

const avatarUrl = 'https://wiki.teamfortress.com/w/images/thumb/d/dc/Banhammer.png/250px-Banhammer.png';
const webhookColor = '#357097'
const webhookName = 'steam-bans'

module.exports = {
    testHook: (url) =>{
        try{
            const hook = new webhook.Webhook(url);
            const msg = new webhook.MessageBuilder()
            .setAvatar(avatarUrl)
            .setName(webhookName)
            .setColor(webHookColor)
            .setTitle('user x banned')
            hook.send(msg)
            return {status: 200}
        }catch(err){
            return {status: 500}
        }
    },
    sendHook: (url,user) =>{
        try{
            const hook = new webhook.Webhook(url)
            const msg = new webhook.MessageBuilder()
            .setTitle(`User ${user.personaname} is now banned on steam!`)
            .setAvatar(avatarUrl)
            .setName(webhookName)
            .setColor(webhookColor)
            .setImage(user.avatarfull)
            .addField('Profile url: ', user.profileurl, true)
            .addField('VAC Banned: ', user.VACBanned.toString())
            .addField('Community Banned: ', user.CommunityBanned.toString())
    
            hook.send(msg)
            return {status: 200}
        }catch(err){
            return {status: 404, err: err.message}
        }
    }
}



