var userModel = require('../models/user');


function Set() {

}

Set.prototype.username = function(letter, session) {
    var user = new userModel.User({
        username: letter.directive.set.username
    });
    session.setUser(user);
    user.save(function(err) {
        if (err) {
            logger.info('save user has an err!');
        } else {

        }
    });
    console.log(user);
};

var set = new Set();

module.exports = set;
