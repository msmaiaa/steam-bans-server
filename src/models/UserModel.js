const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    steamid64: String,
    sendDiscord: Boolean,
    discordHook: String,
})

module.exports = mongoose.model('User',UserSchema);