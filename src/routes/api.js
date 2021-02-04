const express = require("express");
const router = express.Router();
const AuthController = require('../controllers/auth');
const ApiController = require("../controllers/api")

router.post('/createUser', ApiController.createUser);
router.post('/fetchProfile', ApiController.fetchProfile);
router.use(AuthController.check_token);
router.get('/getObservedUsersList', ApiController.getObservedUsersList);
router.post('/createObservedUser', ApiController.createObservedUser);
router.post('/checkObservedUser', ApiController.checkObservedUser);
router.patch('/updateUser', ApiController.updateUser);

module.exports = router;