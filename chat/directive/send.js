var directiveMessage = require('./message');

function Send() {

}

/**
 * message 是聊天中的概念,其包含了聊天所必需的一切
 * @param  {[type]} letter  [description]
 * @param  {[type]} session [description]
 * @return {[type]}         [description]
 */
Send.prototype.message = function(letter, session) {
    directiveMessage[letter.message.type](letter, session);
};

var send = new Send();

module.exports = send;
