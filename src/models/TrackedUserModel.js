const mongoose = require('mongoose');

const TrackedUser = new mongoose.Schema({
    observerId64: String,
    steamid64: String,
    discordSent: Boolean,
})

module.exports = mongoose.model('TrackedUser', TrackedUser);