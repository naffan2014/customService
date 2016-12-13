var config = require('../config');

exports.index = function(req, res, next) {
  res.render('index', {
    test: 'test',
    haha: 'haah1'
  });
};
