var uuid = require('uuid');
/**
 * 此session 当一个客户端成功连接到后台的时候被创建
 * 并且在其他地方会以 username 为key 引用此session
 *  这些 map 很多都是原型的属性, 共享的属性
 */
function Session() {
    //  随机生成一个id
    this.sessionid = uuid.v4();
    this.map = new Map();

    this.socket = null;
    this.user = null;

    this.sessionsMap.set(this.sessionid, this);

}
module.exports = Session;

// key sessionid , value session
Session.prototype.sessionsMap = new Map();
// key username , value user
Session.prototype.usersMap = new Map();

Session.prototype.usersList = [];
// key socketid , value socket
Session.prototype.socketsMap = new Map();
// key username , value session
Session.prototype.userSessionsMap = new Map();

Session.prototype.setUser = function(user) {
    this.user = user;
    this.usersMap.set(user.username, user);
    this.userSessionsMap.set(user.username, this);
    this.usersList.push(user);
};

Session.prototype.getUser = function() {
    return this.user;
};

Session.prototype.setSocket = function(socket) {
    this.socket = socket;
    this.socketsMap.set(socket.id, socket);
};

Session.prototype.getSocket = function() {
    return this.socket;
};

/**
 * 保存一个属性
 * @param  {[type]} key   [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
Session.prototype.set = function(key, value) {
    this.map.set(key, value);
};

/**
 * 获取一个属性
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
Session.prototype.get = function(key) {
    return this.map.get(key);
};


/**
 * 销毁此session
 * @return {[type]} [description]
 */
Session.prototype.invalidate = function() {

};
