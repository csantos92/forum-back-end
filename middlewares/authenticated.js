'use strict'

//Imports
var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "generate-secret-key-9999";

exports.authenticated = function (req, res, next) {

    //Check if authorization header has been sent
    if (!req.headers.authorization) {
        //Return message
        return res.status(403).send({
            message: 'La petición no tiene la cabecera de authentication'
        });
    }

    //Remove token quotes
    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        //Decode token
        var payload = jwt.decode(token, secret);

        //Check if token has expired
        if (payload.exp <= moment().unix()) {
            //Return message
            return res.status(404).send({
                message: 'El token ha expirado'
            });
        }

    } catch (ex) {
        //Return message
        return res.status(404).send({
            message: 'El token no es válido'
        });
    }

    //Insert identified user to the request
    req.user = payload;

    //Exits middleware
    next();
};