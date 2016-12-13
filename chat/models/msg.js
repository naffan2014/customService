var my_mongodb = require('../../core/mongodb');

var Schema = my_mongodb.Schema;
var mongoose = my_mongodb.mongoose;

var msgSchema = Schema({
    msgid: String,
    fromuserid: String,
    touserid: String,
    content: String
});

/**
 * 目前是一次讲该用户所有的聊天记录读取
 * @param  {[type]}   touserid [description]
 * @param  {Function} cb       [description]
 * @return {[type]}            [description]
 */
msgSchema.statics.userChatHistory = function(touserid, cb) {
    return this.find({
        touserid: touserid
    }, cb);
};

var Msg = mongoose.model('msg', msgSchema);

exports.msgSchema = msgSchema;

exports.Msg = Msg;
