'user strict'

//Imports
var express = require('express');
var UserController = require('../controllers/user');

//Create routes
var router = express.Router();

//Import middleware
var md_auth = require('../middlewares/authenticated');

//Import file upload module
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });

//User controller routes
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);

//Exports
module.exports = router;