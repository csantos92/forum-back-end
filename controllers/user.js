'use strict'

//Imports
var validator = require('validator');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var jwt = require('../services/jwt');

var controller = {

    save: function (req, res) {
        //Get params
        var params = req.body;

        try {
            //Validate data
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            //Return message
            return res.status(500).send({
                message: "Faltan datos por enviar"
            });
        }

        if (validate_name && validate_surname && validate_email && validate_password) {
            //Create user object
            var user = new User();

            //Inser data into user
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email;
            user.role = 'ROLE_USER';
            user.image = null;

            //Check if the user already exists
            User.findOne({ email: user.email }, (err, issetUser) => {
                if (err) {
                    //Return message
                    return res.status(500).send({
                        message: "Error al comprobar usuario"
                    });
                }

                if (!issetUser) {
                    //Cypher password
                    bcrypt.hash(params.password, 2, function (err, hash) {
                        if (err) {
                            //Return message
                            return res.status(500).send({
                                message: "Error al cifrar la contraseña"
                            });
                        }

                        //Insert encrypted pass into user object
                        user.password = hash;

                        //Save user into DB
                        user.save((err, userStored) => {
                            if (err) {
                                //Return message
                                return res.status(500).send({
                                    message: "Error al registrar usuario"
                                });
                            }

                            if (!userStored) {
                                //Return message
                                return res.status(400).send({
                                    message: "El usuario no se ha guardado"
                                });
                            }

                            //Return message
                            return res.status(200).send({
                                status: 'success',
                                user: userStored
                            });
                        });
                    });

                } else {
                    //Return message
                    return res.status(200).send({
                        message: "El usuario ya está registrado"
                    });
                }
            })

        } else {
            //Return message
            return res.status(200).send({
                message: "Validación incorrecta"
            });
        }
    },

    login: function (req, res) {
        //Get params
        var params = req.body;

        try {
            //Validate data
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            //Return message
            return res.status(500).send({
                message: 'Faltan datos por enviar'
            });
        }

        if (!validate_email || !validate_password) {
            //Return message
            return res.status(200).send({
                message: 'Validación incorrecta'
            });
        }

        //Check if email exists 
        User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
            if (err) {
                //Return message
                return res.status(500).send({
                    message: 'Error al intentar identificarse'
                });
            }

            if (!user) {
                //Return message
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            }

            //CHeck if password matches
            bcrypt.compare(params.password, user.password, (err, check) => {
                if (check) {
                    //Generate jwt token
                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });

                    } else {
                        //Erase password from object
                        user.password = undefined;

                        //Return message
                        return res.status(200).send({
                            user
                        });
                    }

                    //Return message
                    return res.status(200).send({
                        message: 'Login correcto'
                    });

                } else {
                    //Return message
                    return res.status(500).send({
                        message: 'Contraseña incorrecta'
                    });
                }
            })
        });
    },

    update: function (req, res) {
        //Get params
        var params = req.body;

        try {
            //Validate data
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {
            //Return message
            return res.status(500).send({
                message: 'Faltan datos por enviar'
            });
        }

        //Remove properties that won't update
        delete params.password;

        //Get user id
        var userId = req.user.sub;

        //Check if email is not used
        if (req.user.email != params.email) {
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
                if (err) {
                    //Return message
                    return res.status(500).send({
                        message: 'Error al intentar actualizar el email'
                    });
                }

                if (user && user.email == params.email) {
                    //Return message
                    return res.status(200).send({
                        message: 'El email ya existe'
                    });
                }

            });
        }

        //Get and update user
        User.findByIdAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {
            if (err || !userUpdated) {
                //Return message
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar usuario'
                });
            }

            //Return message
            return res.status(200).send({
                status: 'success',
                user: userUpdated
            });
        });
    },

    uploadAvatar: function (req, res) {
        //Get file
        var file_name = 'Avatar no subido';

        if (!req.files) {
            //Return message
            return res.status(404).send({
                status: 'error',
                file: file_name
            });
        }

        //Get image path
        var file_path = req.files.file0.path;

        //Split image path - Linux or Mac have to split '//'
        var file_split = file_path.split('\\');

        //Get image name
        var file_name = file_split[2];

        //Get extension
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        //Check image extension
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            //Delete image
            fs.unlink(file_path, (err) => {
                //Return message
                return res.status(404).send({
                    status: 'error',
                    message: 'La extensión del archivo no es válida'
                });
            });
        } else {
            //Get identified user
            var userId = req.user.sub;

            //Get and update user
            User.findByIdAndUpdate({ _id: userId }, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err || !userUpdated) {
                    //Return message
                    return res.status(404).send({
                        status: 'error',
                        message: 'Error al subir la imagen'
                    });
                }

                //Return message
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });
            });
        }
    },

    avatar: function (req, res) {
        //Get avatar
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/' + fileName;

        //Check if avatar exists
        fs.exists(pathFile, (exists) => {
            if (exists) {
                res.sendFile(path.resolve(pathFile));
            } else {
                //Return message
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe'
                });
            }
        })
    },

    getUsers: function (req, res) {
        User.find().exec((err, users) => {
            if (err || !users) {
                //Return message
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },

    getUser: function (req, res) {
        var userId = req.params.userId;

        User.findById(userId).exec((err, user) => {
            if (err || !user) {
                //Return message
                return res.status(404).send({
                    status: 'error',
                    message: 'El usuario no existe'
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            });
        });
    }
};

//Export
module.exports = controller;