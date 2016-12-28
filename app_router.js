var express = require('express');

// controllers
var home = require('./controllers/home');
var upload = require('./controllers/upload');


var router = express.Router();
router.get('/', home.index);
router.post('/file/upload',upload.image);


module.exports = router;
