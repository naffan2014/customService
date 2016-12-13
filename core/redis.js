var config = require('../config');

var redis = require('redis');
client = redis.createClient(config.redis.port, config.redis.host, config.redis.opts);

client.auth(config.redis.pwd, function() {
    console.log('redis 登录成功');
});

client.on('ready', function() {
    console.log('redis ready');
});

client.on('connect', function() {

});

client.on('reconnecting', function() {

});

client.on('error', function() {
    console.log('redis 发生了错误');
});

client.on('end', function() {

});

exports.hgetall = function(key, func) {
    client.hgetall(key, function(err, obj) {
        console.log('--------------');
        console.log('redis hgetall is :');
        console.log(key);
        console.log(obj);
        console.log('--------------');
        func(obj);
    });
};

exports.hdel = function(hashkey, key, func) {
    client.hdel(hashkey, key);
};

exports.hset = function(hashkey, key, value, func) {
    client.hset(hashkey, key, value, func);
};

exports.hmset = function(key, obj) {
    client.hmset(key, obj);
};
