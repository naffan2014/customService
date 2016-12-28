var config = {
    hostname: 'localhost',
    debug: false,
    port: 3000,
    redis: {
        port: 12312,
        host: "127.0.0.1",
        pwd:123456,
        opts: {}
    },
    socketio:{
      port:3000
    }
};

module.exports = config;
