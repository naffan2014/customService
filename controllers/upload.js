/**
 * http://usejsdoc.org/
 */
var logger = require('../common/logger');
var qs = require('querystring');

var writeOut = function (query, res) {
    logger.info('req:',JSON.stringify(query));
    res.write(JSON.stringify(query));
    res.end();
}


exports.image = function(req, res, next) {
    res.writeHead(200,{'Content-Type':'text/json','Access-Control-Allow-Origin':'http://localhost'});
    logger.info('start');
    var postData = "";
    req.addListener("data", function (data) {
        logger.info('data:11111');
        //var obj = qs.parse(data);
        
    });
    req.addListener("end", function () {
        logger.info("abababab");
        // var query = qs.parse(postData);
        // writeOut(query, res);
    });
    res.end();
}

