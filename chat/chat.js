var uuid = require('node-uuid');
var logger = require('tracer').colorConsole();

var chat_msg = require('./models/msg');

function Chat() {

}

module.exports = Chat;

Chat.prototype={
  saveMsg:function(param) {
    param.msgid = uuid.v4();
    var msg = new chat_msg.Msg(param);
    msg.save(function(err,msg){
        if(null === err) {
          logger.info('聊天记录保存成功');
        }
    });
  }
};
