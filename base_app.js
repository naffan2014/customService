var express = require('express');
var path = require('path');
var _ = require('lodash');

var bodyParser = require('body-parser');
var helmet = require('helmet');

var config = require('./config');
var logger = require('./common/logger');
var app_router = require('./app_router');

var app = express();



// 静态文件目录
var staticDir = path.join(__dirname, 'public');
var distDir = path.join(__dirname, 'dist');

// express.static 是 express 唯一一个内置的中间件
// public 是挂载路径,是对外界生效的, 不是指本地public的意思,本地的这个public 是在上面语句中指定的
// 这个方法可以多次调用, 查找是按照添加的顺序查找
app.use('/public', express.static(staticDir));
app.use('/dist', express.static(distDir));

app.use(bodyParser.json({
    limit: '1mb'
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '1mb'
}));

// 视图目录
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

// 网站安全增强
// app.use(helmet());

_.extend(app.locals, {
    config: config
});

// router
app.use('/', app_router);

var server = app.listen(config.port, function() {
    logger.info('listening on port', config.port);
    logger.info('You can debug your app with http://' + config.hostname + ':' + config.port);
    logger.info('');
});

exports.app = app;
exports.server = server;
