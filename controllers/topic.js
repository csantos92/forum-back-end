'use strict'

//Imports
var validator = require('validator');
var Topic = require('../models/topic');

var controller = {

    save: function (req, res) {
        //Get params
        var params = req.body;

        //Validate data
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        } catch (err) {
            //Return message
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_title && validate_content && validate_lang) {
            //Create object
            var topic = new Topic();

            //Insert values
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;

            //Save object
            topic.save((err, topicStored) => {
                if (err || !topicStored) {
                    //Return message
                    return res.status(400).send({
                        status: 'error',
                        message: 'El tema no se ha guardado'
                    });
                }

                //Return message
                return res.status(200).send({
                    status: 'success',
                    topic: topicStored
                });
            });

        } else {
            //Return message
            return res.status(200).send({
                message: 'Los datos no son válidos'
            });
        }
    },

    getTopics: function (req, res) {
        //Get current page
        if (!req.params.page || req.params.page == 0 || req.params.page == "0" || req.params.page == null || req.params.page == undefined) {
            var page = 1;
        } else {
            var page = parseInt(req.params.page);
        }

        //Pagination options
        var options = {
            sort: { date: -1 },
            populate: 'user',
            limit: 5,
            page: page
        };

        //Find paginate
        Topic.paginate({}, options, (err, topics) => {
            if (err) {
                //Return message
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al hacer la consulta'
                });
            }

            if (!topics) {
                //Return message
                return res.status(404).send({
                    status: 'notFound',
                    message: 'No hay temas'
                });
            }

            //Return data
            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });
    },

    getTopicsByUser: function (req, res) {
        //Get uer id
        var userId = req.params.user;

        //Find user
        Topic.find({
            user: userId
        })
            .sort([['date', 'descending']])
            .exec((err, topics) => {
                if (err) {
                    //Return message
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if (!topics) {
                    //Return message
                    return res.status(404).send({
                        status: 'error',
                        message: 'No hay temas'
                    });
                }

                //Return data
                return res.status(200).send({
                    status: 'success',
                    topics
                });
            })
    },

    getTopic: function (req, res) {
        //Get topic id
        var topicId = req.params.id;

        //Find topic by id
        Topic.findById(topicId)
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
    },

    update: function (req, res) {
        //Get topic id
        var topicId = req.params.id;

        //Gat data form post
        var params = req.body;

        //Validate data
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        } catch (err) {
            //Return message
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_title && validate_content && validate_lang) {
            //Updatable data 
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            };

            //Find and update topic by topic id and user id
            Topic.findByIdAndUpdate({ _id: topicId, user: req.user.sub }, update, { new: true }, (err, topicUpdated) => {
                if (err) {
                    //Return message
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar el tema'
                    });
                }

                if (!topicUpdated) {
                    //Return message
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tema no se ha actualizado'
                    });
                }

                //Return data
                return res.status(200).send({
                    status: 'success',
                    topic: topicUpdated
                });
            });

        } else {
            //Return message
            return res.status(200).send({
                message: 'La validación de datos no es correcta'
            });
        }
    },

    delete: function (req, res) {
        //Get topic id
        var topicId = req.params.id;

        //Find and delete topic by topic id and user id
        Topic.findByIdAndDelete({ _id: topicId, user: req.user.sub }, (err, topicRemoved) => {
            if (err) {
                //Return message
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al eliminar el tema'
                });
            }

            if (!topicRemoved) {
                //Return message
                return res.status(404).send({
                    status: 'error',
                    message: 'El tema no se ha eliminado'
                });
            }

            //Return data
            return res.status(200).send({
                status: 'success',
                topic: topicRemoved
            });
        });
    },

    search: function (req, res) {
        //Get string from URL
        var searchString = req.params.search;

        //Find or
        Topic.find({
            '$or': [
                { "title": { '$regex': searchString, '$options': 'i' } },
                { "content": { '$regex': searchString, '$options': 'i' } },
                { "code": { '$regex': searchString, '$options': 'i' } },
                { "lang": { '$regex': searchString, '$options': 'i' } }
            ]
        })
        .populate('user')
        .exec((err, topics) => {
            if (err) {
                //Return message
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if (!topics) {
                //Return message
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas disponibles'
                });
            }

            //Return data
            return res.status(200).send({
                status: 'success',
                topics
            });
        })
    }
};

module.exports = controller;