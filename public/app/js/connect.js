var Pubsub = require('./pubsub');
var middle = require('./middle');
var config = require('./config');
var mycookie = require('./cookie');

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
    this.socket.onopen = function (obj) {
        //已经建立连接
        console.log("已连接到服务器");
        //重连时的重置操作
        middle.my_connect = true;
        middle.my_connect_hint = '';
        middle.heartBeatTimer = 0;
        $('#alertHint',middle.currentUserDom).css('display','none');
        //public_chat.toggleChatView(public_chat.users);//连接服务器后显示聊天窗口
        middle.my_connect = true //连接开启
        //定时心跳
        middle.heartBeatFlag = setInterval(function () {
            middle.heartBeatTimer ++;//记录心跳次数
            public_chat.heartBeat(mycookie.getCookie('loginCid')); 
            //console.log('middle.heartBeatTimer',middle.heartBeatTimer)
            if(middle.heartBeatTimer > 3 && middle.heartBeatTimer <= 6){
                middle.my_connect_hint = '网络中断，正在连接中...';
                $('#alertHint',middle.currentUserDom).css('display','block');
                $('#alertHint',middle.currentUserDom).html(middle.my_connect_hint);
                
                //进行重连
                console.log('开始重连')
                var loginGid = mycookie.getCookie('loginGid');
                var loginCid = mycookie.getCookie('loginCid');
                var loginToken = mycookie.getCookie('loginToken');
                //构造websocket通讯地址
                var jsonStr = '{"group_id":"'+ loginGid +'","customer_id":"' + loginCid + '","token":"'+ loginToken +'"}';
                var socketData = window.btoa(jsonStr);
                var socketUrl = config.api.communication_server_host +"?data="+ socketData;
                var socketRes = middle.connect.connect(socketUrl);
            }else if(middle.heartBeatTimer > 6){
                middle.my_connect_hint = '已断开连接，请重新登录';
                $('#alertHint',middle.currentUserDom).css('display','block');
                $('#alertHint',middle.currentUserDom).html(middle.my_connect_hint);
                clearInterval(middle.heartBeatFlag);
                middle.my_connect = false;
            }else{
                
                $('#alertHint',middle.currentUserDom).css('display','none');
            }
        }, 30000);
    };
    // this.socket.onclose = function (obj) {
        // console.log("已断开与服务器的连接");
        // //已经关闭连接
        // //clearInterval(middle.heartBeatFlag);//断开连接了就没有必要再走心跳了
        // middle.my_connect = false;
        // middle.my_connect_hint = '已断开与服务器的连接';
        // $('#alertHint',middle.currentUserDom).css('display','block');
        // $('#alertHint',middle.currentUserDom).html(middle.my_connect_hint);
    // };
    this.socket.onmessage = function (obj) {
        
        //console.log('java原始数据',obj);
        //收到服务器消息
        var data = JSON.parse(obj.data);
        // console.log('总消息结构');
        // console.dir(data);
        type = data.type;//提取socket消息类型
        if(type == 'entercs' || type == 'message'){
            if(document.hidden){
                document.title = "您有一条新的短消息";
                scrollTitle();
            }
        }
        switch(type){
            case 'entercs':
                console.log('有用户接入');
                //考虑某些缺少默认数据的用户，自动给他加上默认值
                if(undefined == data.ext_content){
                    data.ext_content = {};
                    data.ext_content.name = config.name.kr;
                    data.ext_content.pic = config.avatar.kr;
                }
                data.connect = 1; //用户连接着
                //存入用户集合
                var jsonfyData = JSON.stringify(data); //为了显示用户列表埋的数据(替换成存入localstorage)
                localStorage.setItem('csyouyun'+data.from,jsonfyData);
                public_chat.users[data.from] = data;
                //存入HashMap中
                public_chat.usersMap.set(data.from, data);//为了更新未读数埋的数据
                middle.userAvatarComponent.userListScope.$apply();
                break;
            case 'reentercs':
                console.log('用户重新接入');
                //考虑某些缺少默认数据的用户，自动给他加上默认值
                if(undefined == data.ext_content){
                    data.ext_content = {};
                    data.ext_content.name = config.name.kr;
                    data.ext_content.pic = config.avatar.kr;
                }
                data.connect = 1; //用户连接着
                //存入用户集合
                var jsonfyData = JSON.stringify(data); //为了显示用户列表埋的数据(替换成存入localstorage)
                localStorage.setItem('csyouyun'+data.from,jsonfyData);
                public_chat.users[data.from] = data;
                //存入HashMap中
                public_chat.usersMap.set(data.from, data);//为了更新未读数埋的数据
                middle.userAvatarComponent.userListScope.$apply();
                break;
            case 'leavecs':
                console.log('用户退出');
                break;
            case 'message':
                console.log('message');
                directive.receive(data);
                 break;
            case 'kill_user':
                console.log(data,'被kill掉了');
                for(var key in data.uids){
                    console.log(data.uids[key]);
                    delete public_chat.users[data.uids[key]];
                    localStorage.removeItem('csyouyun'+data.uids[key]);
                }
                middle.userAvatarComponent.userListScope.$apply();
                break;
            case 'heartBeat':
                middle.heartBeatTimer --;
                break;
            case 'time_out_user':
                console.log('用户长时间没有说话自动断开',data.uid);
                var userDom = public_chat.chatWindowDom.get(data.uid);
                $('#alertHint',userDom).css('display','block');
                $('#alertHint',userDom).html("客户长时间未应答，已结束回话");
                //将connect位置为0,用来客服关闭的时候判断是否再发消息，庆磊提出
                var oneInformation = JSON.parse(localStorage.getItem('csyouyun'+data.uid));
                oneInformation.connect = 0;
                localStorage.setItem('csyouyun'+data.uid,JSON.stringify(oneInformation));
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
        console.log("socket产生异常",obj);
    }; 
};

/*
 * 发送消息
 */
Connect.prototype.deliver = function(letter) {
    //增加ext_content信息
    var localStorageInformation = JSON.parse(localStorage.getItem('csyouyun'+letter.to));
    if(null != localStorageInformation){
        letter.ext_content = {
            name:localStorageInformation.ext_content.name,
            id:localStorageInformation.from,
            //pic:localStorageInformation.ext_content.pic,
            pic:'http://cs.17youyun.com/public/app/img/avatar/kfavatar.png',
        };
         console.log('deliver',letter)
    }
    if(mycookie.getCookie('loginGid') && mycookie.getCookie('loginCid') && mycookie.getCookie('loginToken')){
        this.socket.send(JSON.stringify(letter));
        //console.log('发出的消息是',JSON.stringify(letter));
    }else{
        alert('你还没有登录，请先登录');
        window.location.reload();
        return false;
    }
};

/*
 * 接受发送消息，吐给最终消息
 */
Connect.prototype.send = function(letter) {
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

