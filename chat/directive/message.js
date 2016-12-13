function Message() {

}

/**
 * 一对一聊天消息
 * @param  {[type]} letter  [description]
 * @param  {[type]} session [description]
 * @return {[type]}         [description]
 */
Message.prototype.one = function(letter, session, deliver) {
    var message = letter.message;
    var receiveUserSession = session.userSessionsMap.get(message.receiveUser);
 
    if (null !== receiveUserSession) {
        // 当前用户在线
        delete letter.directive.send;
        letter.directive.receive = {
            message: null
        };
        receiveUserSession.deliver(letter);
    } else {
        // 当前用户不在线
    }
};

/**
 * 群聊消息
 * @param  {[type]} letter  [description]
 * @param  {[type]} session [description]
 * @return {[type]}         [description]
 */
Message.prototype.some = function(letter, session) {

};

var message = new Message();

module.exports = message;
