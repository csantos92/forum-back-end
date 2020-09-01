'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;

//Set deprecated method off
mongoose.set('useFindAndModify', false);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', {useNewUrlParser: true})
        .then(() => {
            console.log("Connected to MongoDB");

            //Create server
            app.listen(port, () => {
                console.log("Server running on http://localhost:3999");
            })
        })
        .catch(error => console.log(error));