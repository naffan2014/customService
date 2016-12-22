var config = require('./config');
var Connect = require('./connect');
var middle = require('./middle');

// 没有<> 就变成选取元素了
var templateDiv = $("<div>");

// 自己的聊天消息
var chatMsgRight;
// 他人的聊天消息
var chatMsgLeft;
// 聊天窗口
var chatWindow;


var msg_input;

var msg_end;

// 聊天框显示出最新的
function msgScrollEnd() {
    msg_end[0].scrollIntoView();
}

/**
 * 自己的消息
 * 一条消息需要名字,时间,头像,内容
 * @return {[type]} [description]
 */
function insertChatMsgRight(content) {
    var date = new Date();
    var clone = chatMsgRight.clone();
    clone.find(".direct-chat-timestamp").html((new Date()).toLocaleTimeString());
    clone.find(".direct-chat-text").html(content);
    msg_end.before(clone);
}

/**
 * 对方的消息
 * @return {[type]} [description]
 */
function insertChatMsgLeft(message) {
    var date = new Date();
    var clone = chatMsgLeft.clone();
    clone.find(".direct-chat-timestamp").html((new Date()).toLocaleTimeString());
    clone.find(".direct-chat-text").html(message);
    clone.find('img').attr('src', message.avatar);
    msg_end.before(clone);
}

function Chat() {
    this.connect = null;
    //登入进来的用户
    this.users = {};
    //当前聊天窗口的用户
    this.currentChat = {
        theUser: null,
        username: null,
        chatname: null
    };
    this.signinuser = {
        username: null
    };
    // key username value chat window  dom
    this.chatWindowDom = new Map();
}

/**
 * 清除掉未读信息
 * @param  {[type]} user [description]
 * @return {[type]}      [description]
 */
Chat.prototype.clearUnread = function(user) {
    user.unreadMsgCount = 0;
    middle.userAvatarComponent.userListScope.$apply();
};

Chat.prototype.updateChatView = function(data){
    var chat = this;
    // contentFormat = JSON.parse(data.content);
    // messageContent = contentFormat.content;
    var userDom = chat.chatWindowDom.get(data.from);
    if (userDom === undefined || userDom === null) {
        userDom = chat.chatWindow.clone();
        chat.chatWindowDom.set(data.from, userDom);
        userDom.find('#chatWindow-username').html(data.from);
     }
     msg_input = userDom.find("#msg-input");
     msg_end = userDom.find("#msg_end");
     insertChatMsgLeft(data.content);
};

Chat.prototype.toggleChatView = function(user) {
    var chat = this;
    var userDom = chat.chatWindowDom.get(user.from);
    if (userDom === undefined || userDom === null) {
        userDom = chat.chatWindow.clone();
        chat.chatWindowDom.set(user.from, userDom);
        userDom.find('#chatWindow-username').html(user.from);
    } else {
        console.log('userdom is not null');
    }
    userDom.find('#msg-input').on('keydown', function(event) {
        if (event.keyCode === 13) {
            // 回车
            chat.say();
        }
    });
    userDom.find('#say').click(function() {
        chat.say();
    });
    msg_input = userDom.find("#msg-input");
    msg_end = userDom.find("#msg_end");
    $('#chatWindowDiv').replaceWith(userDom);
};

/**
 * 接收到消息,但不一定会显示出来,只有当前的窗口就是该消息来源时才会显示
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
Chat.prototype.receiveMessage = function(message) {
    playMsgComingPromptTone();
    message = specifyMessageType(message);
    // contentFormat = JSON.parse(message.content);
    // messageContent = contentFormat.content;
    // messageType = contentFormat.type;
    var sendUserName = message.from;
    if (sendUserName === this.currentChat.username) {
        // 当前窗口是和发送用户
        //message.avatar = this.currentChat.theUser.avatar;
        this.listen(message.content);
    } else {
        // 当前窗口并不是该用户
        var user = this.usersMap.get(sendUserName);
        console.log('receiveMessage中获取Map用户信息:')
        console.log(user);
        // 未读消息加1
        if (user.unreadMsgCount === undefined) {
            user.unreadMsgCount = 0;
        }
        user.unreadMsgCount += 1;
        this.usersMap.set(sendUserName,user);
        this.updateChatView(message)
        middle.userAvatarComponent.userListScope.$apply();
    }
};

/**
 * 该方法在会显示出 对方的消息
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
Chat.prototype.listen = function(message) {
    insertChatMsgLeft(message);
    msgScrollEnd();
};

Chat.prototype.say = function() {
    console.log('in say')    
    var msg = msg_input.val();
    if (msg !== '') {
        msg_input.val(null);
        insertChatMsgRight(msg);
        msgScrollEnd();

        var letter = {
             type:'message',
             content:{
                 type:'text',
                 content:msg,
             },
             from:this.signinuser.username,
             to:this.currentChat.username,
             id:'asdfasdfasdfsadfds123',
        }
        // if (chat.currentChat.username !== null) {
            // // 单聊
            // letter.message.receiveUser = chat.currentChat.username;
            // letter.message.type = 'one';
        // } else {
            // // 群聊
            // letter.message.receiveUser = chat.currentChat.chatname;
            // letter.message.type = 'some';
        // }

        // 发送到服务器
        this.connect.sendToUser(letter);
    }
};

Chat.prototype.refreshUserList = function() {
    middle.userAvatarComponent.userListScope.$apply();
};

Chat.prototype.signIn = function(username) {
    this.connect.sign_in(username);
};

// key username ,value 客户端 user
Chat.prototype.usersMap = new Map();

// 引用设置项
Chat.prototype.setting = {
    msgSoundPrompt: true
};

/**
 * 设置是否开启消息声音提示,如果不传参数会在两种状态间切换
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
Chat.prototype.settingMsgSoundPrompt = function(value) {
    if (value === undefined) {
        this.setting.msgSoundPrompt = !this.setting.msgSoundPrompt;
    } else {
        this.setting.msgSoundPrompt = value;
    }
};

var chat = new Chat();
// var connect = new Connect(chat);
// chat.connect = connect;
// 连接server
//connect.connect(config.communication_server_host);
// TODO 防止缓存的问题
templateDiv.load('/public/app/template/template.html', function() {

    chatMsgRight = templateDiv.find("#msg-right>div");
    chatMsgLeft = templateDiv.find("#msg-left>div");
    chatMsgImage = templateDiv.find("#msg-image>div");
    chatWindow = templateDiv.find("#chatWindow>div");

    // 加载完在赋值
    chat.chatWindow = chatWindow;

});

var audio;

$(function() {
    audio = document.getElementById('audio');
});

function playMsgComingPromptTone() {
    if (chat.setting.msgSoundPrompt) {
        audio.play();
    }
}

function specifyMessageType(message){
    console.log('in specifyMessageType');
    switch(message.type){
        case 'image':
            console.log('消息是图片');
            var clone = chatMsgImage.clone();
            clone.find('a').attr("href", messageContent.image_url);
            clone.find('img').attr("src", "data:image/jpeg;base64," + messageContent.image_thumb);
            message.content = clone;
            break;
        default:
            console.log('消息是文字');
            message.content = message.content.content;
    }
    console.log('转化后的消息格式');
    console.log(message);
    return message;
}


module.exports = chat;
