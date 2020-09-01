'use strict'

//Requires
var express = require('express');
var bodyParser = require('body-parser');

//Run express
var app = express();

//Import routes from controllers
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comment_routes = require('./routes/comment');

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*Test route
app.get('/test', (req, res) => {
    return res.status(200).send({
        message: "ola k ase"
    });
});
*/

//CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Rewrite routes
app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comment_routes);

//Export
module.exports = app;