'user strict'

//Imports
var Topic = require('../models/topic');
var validator = require('validator');

var controller = {
    add: function (req, res) {
        //Get topic id
        var topicId = req.params.topicId;

        //Find topic by id
        Topic.findById(topicId).exec((err, topic) => {
            if (err) {
                //Return message
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if (!topic) {
                //Return message
                return res.status(404).send({
                    status: 'error',
                    message: 'El tema no existe'
                });
            }

            //Check user object
            if (req.body.content) {
                try {
                    //Validate data
                    var validate_content = !validator.isEmpty(req.body.content);

                } catch (err) {
                    //Return message
                    return res.status(200).send({
                        message: 'Faltan datos por enviar'
                    });
                }

                if (validate_content) {
                    //Create comment object
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content
                    };

                    //Push variable comment into comments inside the topic collection
                    topic.comments.push(comment);

                    //Save topic object
                    topic.save((err) => {
                        if (err) {
                            //Return message
                            return res.status(404).send({
                                status: 'error',
                                message: 'Error al guardar comentario'
                            });
                        }

                        //Find topic by id
                        Topic.findById(topic._id)
                            .populate('user')
                            .populate('comments.user')
                            .exec((err, topic) => {
                                if (err) {
                                    //Return message
                                    return res.status(500).send({
                                        status: 'error',
                                        message: 'Error en la petición'
                                    });
                                }
                                if (!topic) {
                                    //Return message
                                    return res.status(404).send({
                                        status: 'error',
                                        message: 'No existe el tema'
                                    });
                                }

                                //Return data
                                return res.status(200).send({
                                    status: 'success',
                                    topic
                                });
                            });
                    });

                } else {
                    //Return message
                    return res.status(200).send({
                        message: 'Error al validar datos'
                    });
                }
            }
        });
    },

    update: function (req, res) {
        //Get comment id
        var commentId = req.params.commentId;

        //Get params
        var params = req.body;

        try {
            //Validate data
            var validate_content = !validator.isEmpty(req.body.content);

        } catch (err) {
            //Return message
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_content) {
            //Find and update a comment
            Topic.findOneAndUpdate(
                { 'comments._id': commentId },
                {
                    '$set': {
                        'comments.$.content': params.content
                    }
                },
                { new: true },
                (err, topicUpdated) => {
                    if (err) {
                        //Return message
                        return res.status(404).send({
                            status: 'error',
                            message: 'Error al actualizar el comentario'
                        });
                    }

                    if (!topicUpdated) {
                        //Return message
                        return res.status(404).send({
                            status: 'error',
                            message: 'No existe el tema con ese ID'
                        });
                    }

                    //Return data
                    return res.status(200).send({
                        status: 'success',
                        topicUpdated
                    });
                }
            );
        }
    },

    delete: function (req, res) {
        //Get topic and comment id
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        //Find topic
        Topic.findById(topicId, (err, topic) => {
            if (err) {
                //Return message
                return res.status(404).send({
                    status: 'error',
                    message: 'Error al buscar el tema'
                });
            }

            if (!topic) {
                //Return message
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tema con ese ID'
                });
            }

            //Get subdocument (comment)
            var comment = topic.comments.id(commentId);

            //Delete comment
            if (comment) {
                comment.remove();

                //Save topic
                topic.save((err) => {
                    if (err) {
                        //Return message
                        return res.status(404).send({
                            status: 'error',
                            message: 'Error al buscar el tema'
                        });
                    }

                    //Find topic by id
                    Topic.findById(topic._id)
                        .populate('user')
                        .populate('comments.user')
                        .exec((err, topic) => {
                            if (err) {
                                //Return message
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'Error en la petición'
                                });
                            }
                            if (!topic) {
                                //Return message
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'No existe el tema'
                                });
                            }

                            //Return data
                            return res.status(200).send({
                                status: 'success',
                                topic
                            });
                        });
                });

            } else {
                //Return message
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el comentario'
                });
            }
        });
    }
}

module.exports = controller;