var my_mongodb = require('../../core/mongodb');

var Schema = my_mongodb.Schema;
var mongoose = my_mongodb.mongoose;

var userSchema = Schema({
    username: String
});

var User = mongoose.model('user', userSchema);

exports.userSchema = userSchema;

exports.User = User;
