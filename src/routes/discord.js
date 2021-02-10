const express = require("express");
const router = express.Router();
const AuthController = require('../controllers/auth');
const DiscordController = require('../controllers/discord');

router.use(AuthController.check_token);
router.post('/test',DiscordController.test);

module.exports = router;