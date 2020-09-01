'use strict'

//Import mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//User model
var UserSchema = Schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String
});

//Deletes password hash of sent object for security
UserSchema.methods.toJSON = function(){
    var obj = this.toObject();
    delete obj.password;

    return obj;
}

//Export
module.exports = mongoose.model('User', UserSchema);