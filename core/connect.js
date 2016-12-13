/**
 * 此文件连接chat 和 socketio
 */

var io_server = require('socket.io');
var logger = require('../common/logger');
var config = require('../config');

var Session = require('../chat/session');
var Directive = require('../chat/directive');
var xredis = require('../core/redis');
var directive;

var io;

var sessionsMap = new Map();

module.exports = SocketioServer;

function SocketioServer(http) {

    // 都可以
    io = io_server(http);
    // io = io_server.listen(http);

    directive = new Directive(io);

    io.on('connection', function(socket) {
        logger.debug('a client connected, socket id is ' + socket.id);

        // 初始化此连接的session
        var session = initSession(socket);

        // letter 事件是本系统内的消息事件
        socket.on('letter', function(letter) {
            directive.handle(letter, session);
        });

        socket.on('error', function(err) {
            console.log('socket id is ' + socket.id + ' has error');
            console.log(err);
        });

        socket.on('disconnect', function() {
            console.log('a client disconnect, socket id is ' + socket.id);
        });

    });
}

function initSession(socket) {
    var session = new Session();
    session.setSocket(socket);
    session.deliver = deliver;
    return session;
}

/**
 * 此方法追加到session 对象上
 * @param  {[type]} letter [description]
 * @return {[type]}        [description]
 */
function deliver(letter) {
    this.getSocket().emit('letter', letter);
}



/**
 * 关闭socketio
 * @return {[type]} [description]
 */
SocketioServer.prototype.shutdown = function() {

};

/**
 * 重启socketio
 * @return {[type]} [description]
 */
SocketioServer.prototype.restart = function() {

};
