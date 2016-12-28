var config = require('../config');

exports.index = function(req, res, next) {
  res.render('index', {
    title: '游云客服系统',
  });
};
