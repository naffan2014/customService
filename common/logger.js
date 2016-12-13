var config = require('../config');

var env = process.env.NODE_ENV || "development";


var log4js = require('log4js');
log4js.configure({
  appenders: [{
    type: 'console'
  }, {
    type: 'file',
    filename: 'logs/logs.log',
    category: 'yifan'
  }],
  // 不替换node 自己的console
  // replaceConsole: true
});

// category 应该是logger的名字的意思
var logger = log4js.getLogger('yifan');
logger.setLevel(config.debug && env !== 'test' ? 'DEBUG' : 'ERROR');

module.exports = logger;
