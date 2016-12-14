var Pubsub = require('./pubsub');


var pubsub = new Pubsub();
// 初始化事件
pubsub.addEvent("signinBack");
pubsub.addEvent("signoutBack");
pubsub.addEvent("msgfromUser");
pubsub.addEvent('chat');



/**
 * 聊天消息回调
 * @param content
 */
function chatBack(content) {
    pubsub.emit('chat', content);
}

/**
 * 登录事件回调
 * @param content
 */
function signInBack(content) {
    console.log("sign in success!");
    pubsub.emit("signinBack", content);
}

/**
 * 登出事件回调
 * @param content
 */
function signOutBack(content) {
    pubsub.emit("signoutBack", content);
}

var public_chat;

function Connect(chat) {
    this.chat = chat;
    public_chat = chat;
    this.socket = null;
}

Connect.prototype.connect = function(host) {
    var socket = io(host);
    //var socket = new WebSocket(host);
    this.socket = socket;

    // 以下是socketio 的内部事件
    socket.on('open', function() {
        console.log("webscoket打开了");
    });
    
    
    socket.on('connect', function() {
        console.log("已连接到服务器");
    });

    socket.on('event', function(data) {

    });

    socket.on('disconnect', function() {

    });

    socket.on('error', function(obj) {
        console.log(obj);
    });

    socket.on('reconnect', function(number) {
        console.log(number);
    });

    socket.on('reconnecting', function(number) {
        console.log(number);
    });

    socket.on('reconnet_error', function(obj) {
        console.log(obj);
    });

    /**
     * letter 是自定义的消息事件
     */
    socket.on('letter', function(letter) {
        console.log(letter);
        // letter = JSON.parse(letter);

        var key = Object.keys(letter.directive)[0];

        if (directive[key] === undefined) {
            console.log('directive ' + key + ' 未实现');
        } else {
            directive[key](letter);

        }

    });
};

Connect.prototype.deliver = function(letter) {
    this.socket.emit("letter", JSON.stringify(letter));
    console.log("deliver a letter: ");
    console.log(JSON.stringify(letter));
};

Connect.prototype.sendToUser = function(letter) {
    this.deliver(letter);
};

Connect.prototype.sign_in = function(username) {
    var letter = {
        directive: {
            client: {
                sign_in: null
            }
        },
        user: {
            username: username
        }
    };
    this.deliver(letter);
};

Connect.prototype.user_presence = function(letter) {

};

/**
 * 通知服务器 本人用户名字
 * @param  {[type]} username [description]
 * @return {[type]}          [description]
 */
Connect.prototype.setUsername = function(username) {
    // letter 如果不指定收件人,则 postoffice 处理
    // var letter = {};
    var letter = {
        directive: {
            set: {
                username: username
            }
        }
    };
    this.deliver(letter);
};

/**
 * 指令对象
 */
function Directive() {

}

Directive.prototype.client = function(letter) {
    var client = {};
    // 有其他用户上线时会调用
    client.user_presence = function(letter) {
        var user = letter.user;
        user.avatar = genereateAvatarImg();
        public_chat.users.push(user);
        public_chat.usersMap.set(user.username, user);
        public_chat.refreshUserList();

    };
    // 登陆后加载当前已经登录的用户
    client.init_userList = function(letter) {

        // 这样使用  第二个参数是参数数组, 而其正好就是一个数组
        Array.prototype.push.apply(public_chat.users, letter.directive.client.init_userList);

        public_chat.users.forEach(function(user) {
            user.avatar = genereateAvatarImg();
            public_chat.usersMap.set(user.username, user);
        });

        public_chat.refreshUserList();
    };
    var key = Object.keys(letter.directive.client);
    client[key](letter);

};

// 随机生成一个用户的头像
function genereateAvatarImg() {
    return '/public/app/img/avatar/avatar' + (Math.floor(Math.random() * 5) + 1) + '.png';
}

Directive.prototype.receive = function(letter) {
    var receive = {};
    receive.message = function(letter) {
        var message = letter.message;
    };
    public_chat.receiveMessage(letter.message);
};

var directive = new Directive();

module.exports = Connect;
