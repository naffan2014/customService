var express = require('express');

// controllers
var home = require('./controllers/home');

var router = express.Router();

router.get('/', home.index);

module.exports = router;
