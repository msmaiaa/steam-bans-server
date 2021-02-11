const webhook = require("webhook-discord")

const avatarUrl = 'https://wiki.teamfortress.com/w/images/thumb/d/dc/Banhammer.png/250px-Banhammer.png';
const webhookColor = '#357097'
const webhookName = 'steam-bans'

module.exports = {
    testHook: async(url) =>{
        try{
            const hook = new webhook.Webhook(url);
            const msg = new webhook.MessageBuilder()
            .setTitle(`User s1mple is now banned on steam! (This is a test)`)
            .setAvatar(avatarUrl)
            .setName(webhookName)
            .setColor(webhookColor)
            .setImage("https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/89/89b6a0e4c74168ae41b38abf06f3dc288e03817b_full.jpg")
            .addField('Profile url: ', 'https://steamcommunity.com/id/officials1mple/', true)
            .addField('VAC Banned: ', 'false')
            .addField('Community Banned: ', 'false')
            return hook.send(msg)
            .then(()=>{
                return {status: 200}
            })
            .catch((err)=>{
                return {status: 500, error:err.message}
            })
        }catch(err){
            return {status: 500, error: err.message}
        }
    },
    sendHook: async(url,user) =>{
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



