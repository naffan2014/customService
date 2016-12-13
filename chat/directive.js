var xredis = require('../core/redis');
var logger = require('../common/logger');
var _ = require('lodash');

// 引入处理指令
var directiveSet = require('./directive/set');
var directiveGet = require('./directive/get');
var directiveSend = require('./directive/send');
var directiveClient = require('./directive/client');

// socket.io  的 io 对象
var myio = {};

module.exports = Directive;

function Directive(io) {
    this.io = io;
    myio = io;
}

Directive.prototype.handle = function(letter, session) {

    letter = JSON.parse(letter);
    logger.info('handle a letter ', letter);

    // 默认一个letter 只能发送一个指令,一次想发送多条指令就需要发送多个letter
    var key = _.keys(letter.directive)[0];

    this[key](letter, session);
};

Directive.prototype.client = function(letter, session) {
    var key = _.keys(letter.directive.client)[0];
    directiveClient[key](letter, session);
};

Directive.prototype.send = function(letter, session) {
    var key = _.keys(letter.directive.send)[0];
    
    directiveSend[key](letter, session);
};

Directive.prototype.set = function(letter, session) {
    var key = _.keys(letter.directive.set)[0];
    directiveSet[key](letter, session);
};

Directive.prototype.get = function(letter, session) {
    var key = _.keys(letter.directive.get)[0];
    directiveGet[key](letter, session);
};
