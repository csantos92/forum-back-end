'user strict'

//Imports
var express = require('express');
var TopicController = require('../controllers/topic');

//Create routes
var router = express.Router();

//Import middleware
var md_auth = require('../middlewares/authenticated');

//Import file upload module
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });

//User controller routes
router.post('/topic', md_auth.authenticated, TopicController.save);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/user-topics/:user', TopicController.getTopicsByUser);
router.get('/topic/:id', TopicController.getTopic);
router.put('/topic/:id', md_auth.authenticated, TopicController.update);
router.delete('/topic/:id', md_auth.authenticated, TopicController.delete);
router.get('/search/:search', TopicController.search);

//Exports
module.exports = router;