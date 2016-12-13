/**
 * 连接mongodb数据库
 */

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chat');

var db = mongoose.connection;

db.on('error', function() {
    console.log('mongoose has an error');
});

db.once('open', function() {
    console.log('mongoose has connected');
});

exports.Schema = mongoose.Schema;

exports.mongoose = mongoose;
