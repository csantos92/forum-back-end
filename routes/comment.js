'user strict'

//Imports
var express = require('express');
var CommentController = require('../controllers/comment');

//Create routes
var router = express.Router();

//Import middleware
var md_auth = require('../middlewares/authenticated');

//User controller routes
router.post('/comment/topic/:topicId', md_auth.authenticated, CommentController.add);
router.put('/comment/:commentId', md_auth.authenticated, CommentController.update);
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, CommentController.delete);

//Exports
module.exports = router;