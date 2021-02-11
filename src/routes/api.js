const express = require("express");
const router = express.Router();
const AuthController = require('../controllers/auth');
const ApiController = require("../controllers/api")

router.post('/fetchProfile', ApiController.fetchProfile);
router.use(AuthController.check_token);
router.get('/getTrackedUsersList', ApiController.getTrackedUsersList);
router.get('/getUserInfo', ApiController.getUserInfo);
router.post('/createUser', ApiController.createUser);
router.post('/createTrackedUser', ApiController.createTrackedUser);
router.post('/checkTrackedUser', ApiController.checkTrackedUser);
router.patch('/updateUser', ApiController.updateUser);
router.delete('/deleteTrackedUser', ApiController.deleteTrackedUser);

module.exports = router;