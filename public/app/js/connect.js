var Pubsub = require('./pubsub');
var middle = require('./middle');

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
    var socket = new WebSocket(host);
    this.socket = socket;
    // this.socket = socket;

    // 以下是socketio 的内部事件

    this.socket.onopen = function (obj) {
    //已经建立连接
        console.log("已连接到服务器");
        public_chat.toggleChatView(public_chat.users);//连接服务器后显示聊天窗口
    };

    this.socket.onclose = function (obj) {
    //已经关闭连接
    console.log("已断开到服务器");
    alert('请检查服务器，服务器未开启')
    };
    
    this.socket.onmessage = function (obj) {
        //收到服务器消息
        console.log('收到消息')
        data = JSON.parse(obj.data);//解析json消息
        console.log(data)
        type = data.type;//提取消息类型
        content = data.content;//提取消息内容
        switch(type){
            case 'entercs':
                console.log('notice');
                //存入用户集合
                data.avatar = genereateAvatarImg();
                public_chat.users.push(data);//为了显示用户列表埋的数据
                //存入session
                public_chat.usersMap.set(data.from, data);//为了更新未读数埋的数据
                middle.userAvatarComponent.userListScope.$apply();
                break;
            case 'message':
                console.log('message');
                //
                directive.receive(data);
                 break;
            case 'leavecs':
                console.log('用户退出');
                break;
            case 'heartbreak':
                console.log('heartbreak');
                break;
            case 'transfer':
                console.log('transfer');
                 break;
            case 'transfer_ack':
                console.log('transfer_ack');
                break;
            default:
                console.log('default');
        }
    };
    
    this.socket.onerror = function (obj) {
    //产生异常
    console.log(obj);
    }; 

    /**
     * letter 是自定义的消息事件
     */
    // socket.on('letter', function(letter) {
        // console.log(letter);
        // // letter = JSON.parse(letter);
// 
        // var key = Object.keys(letter.directive)[0];
// 
        // if (directive[key] === undefined) {
            // console.log('directive ' + key + ' 未实现');
        // } else {
            // directive[key](letter);
// 
        // }
// 
    // });
};

Connect.prototype.deliver = function(letter) {
    //this.socket.emit("letter", JSON.stringify(letter));
    this.socket.send(JSON.stringify(letter));
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
    console.log('Directive.prototype.client  in ');
    var client = {};
    // 有其他用户上线时会调用
    client.user_presence = function(letter) {
        console.log('user_presence');
        var user = letter.user;
        user.avatar = genereateAvatarImg();
        public_chat.users.push(user);
        public_chat.usersMap.set(user.username, user);
        public_chat.refreshUserList();

    };
    // 登陆后加载当前已经登录的用户
    client.init_userList = function(letter) {
        console.log('init_userList');
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

Directive.prototype.receive = function(letter) {
    console.log(letter)
    //message = JSON.parse(letter);//解析消息内容和类型
    //var content = message.content;//消息内容
    //type = message.type;//消息类型
    //TODO:这里面的type有可能是图像，这期先不做
    public_chat.receiveMessage(letter);
};

// 随机生成一个用户的头像
function genereateAvatarImg() {
    return '/public/app/img/avatar/avatar' + (Math.floor(Math.random() * 5) + 1) + '.png';
}


var directive = new Directive();

module.exports = Connect;
