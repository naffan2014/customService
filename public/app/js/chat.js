var config = require('./config');
var Connect = require('./connect');
var middle = require('./middle');

var templateDiv = $("<div>");// 没有<> 就变成选取元素了
var chatMsgRight; // 自己的聊天消息
var chatMsgLeft; // 他人的聊天消息
var chatWindow; // 聊天窗口
var msg_input; //聊天输入
var msg_star; //聊天框最上端
var msg_end; //聊天框最下端
var HistoryNum = 20; //历史记录一次拉回条数

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

/*
 * 当前窗口不是聊天窗口时，也应该建立聊天框，
 * 这样当点击toggleChatView后切换的页面才能够有数据
 * 
 */
Chat.prototype.updateChatView = function(data){
    var chat = this;
    // contentFormat = JSON.parse(data.content);
    // messageContent = contentFormat.content;
    var userDom = chat.chatWindowDom.get(data.from);
    if (userDom === undefined || userDom === null) {
        userDom = chat.chatWindow.clone();
        chat.chatWindowDom.set(data.from, userDom);
        userDom.find('#chatWindow-username').html(this.users[data.from].ext_content.name);
     }
     msg_input = userDom.find("#msg-input");
     msg_start = userDom.find("#box-body");
     msg_end = userDom.find("#msg_end");
     insertChatMsgLeft(data);
};

/*
 * 切换聊天窗口
 */
Chat.prototype.toggleChatView = function(data) {
    var chat = this;
    var userDom = chat.chatWindowDom.get(data.from);
    if (userDom === undefined || userDom === null) {
        userDom = chat.chatWindow.clone();
        chat.chatWindowDom.set(data.from, userDom);
        $('#chatWindow-username',userDom).html(this.users[data.from].ext_content.name);
    } else {
        console.log('userdom不是空的');
    }
    //更新用户资料
    $("#users-info #nick").html(parseInt(Math.random()*10+2, 10))
    $("#users-info #uid").html(parseInt(Math.random()*10+2, 10))
    $("#users-info #phoneNum").html(parseInt(Math.random()*10+2, 10))
    $("#users-info #prvalue").html(parseInt(Math.random()*10+2, 10))
    $("#users-info #sumCount").html(parseInt(Math.random()*10+2, 10))
    $("#users-info #dealCount").html(parseInt(Math.random()*10+2, 10))
    $("#users-info #schoolCount").html(parseInt(Math.random()*10+2, 10))
    //绑定下拉框到顶部后加载聊天记录
    $('div#box-body',userDom).scroll(function(){
        if(0 == $(this).scrollTop()){
            console.log('拉到顶部')
            $.ajax({
              url: config.api.history,
              data: "user_id="+ data.from +"&num="+ HistoryNum +"&next_id="+ $('#lastHistoryId',userDom).html(),
              type: 'get',
              dataType:'jsonp',
              jsonp:'json_callback',
              jsonpCallback:"success_jsonpCallback",
              success: function(res){
                console.log(res);
                if(res == undefined){
                    console.log('mei');
                }else{
                    console.log('you');
                }
                for(var key in res){
                    res[key].content = JSON.parse(res[key].content);
                    console.log(res[key])
                    var resContent = getSpecifyMessageType(res[key])
                    if( res[key].from == res[key].userId){
                        insertChatHistoryLeft(resContent);
                    }else{
                        insertChatHistoryRight(resContent);
                    }
                    //记录历史记录最后一条
                    $('#lastHistoryId',userDom).html(resContent.id);
                }
                //拉取到记录后要把滚动条往下来一点，这是用户体验
                var height = $('div#box-body',userDom).height() * 0.6;
                $('div#box-body',userDom).scrollTop(height);
              },
              error:function(){
                  console.log('获取消息失败，请重试');
              }
            });
        }
    });
    //只需要在这里绑定窗口中的按钮事件，updateChatView则不用，因为都会走这个方法。
    $('#msg-input',userDom).on('keydown', function(event) {
        var content = userDom.find('#msg-input').val();
        if (event.ctrlKey && event.keyCode == 13) {
            // ctrl+回车
            userDom.find('#msg-input').append('\r\n')
        }else if(event.keyCode == 13){
            //回车
            chat.say();
        }
    });
    $('#say',userDom).click(function() {
         chat.say();
    });
    //绑定上传图片
    var tmpTimestamp = Date.parse(new Date());
    $('#imageUpload',userDom).ajaxfileupload({
      action: config.api.upload,
      valid_extensions : ['jpeg','gif','png','jpg'],
      params: {
        'from':data.to,
        'to':data.from,
        'fid':data.to+ '-' + data.from +'-'+ tmpTimestamp,//目前没有用
        //'fid':210000-547240-1482758314000
      },
      onComplete: function(response) {
          console.log('上传图片结果:',response);
        //#TODO:由于跨域的问题导致response回传的数据不规则，所以需要将数据规则化以后在进行判断是否成功。
        var indexOfSearchWord = response.indexOf('\{');
        var temp = response.slice(indexOfSearchWord);
        responseData = JSON.parse(temp);
        console.log(responseData)
        if(true == responseData.result.secess){
            var clone = chatMsgImage.clone();
            clone.find('img').attr("data-original", responseData.result.filePath );
            clone.find('img').attr("src", responseData.result.thumbFilePath);
            insertChatMsgRight(clone);
            msgScrollEnd();
            var uploadData = {
                from:data.to,
                to:data.from,
                fid:responseData.result.fid,
            }
            chat.sayUpload(uploadData);
        }else{
            alert('上传图片失败，请重试。');
        }
      },
      onStart: function() {
        //if(weWantedTo) return false; // cancels upload
      },
      onCancel: function() {
        console.log('no file selected');
        alert('图片上传出现了问题')
      }
    });
    //关闭会话逻辑
    userDom.find('#closeChat').click(function(){
        if(confirm("确定结束本次对话吗？"))
        {
            chat.sayEnd(data);
        }
    });
    
    //
    msg_input = userDom.find("#msg-input");
    msg_start = userDom.find("#box-body");
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
    message = getSpecifyMessageType(message);
    var sendUserName = message.from;
    if (sendUserName === this.currentChat.username) {
        // 当前窗口是和发送用户
        message.avatar = this.currentChat.theUser.avatar;
        this.listen(message);
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
Chat.prototype.listen = function(data) {
    insertChatMsgLeft(data);
    msgScrollEnd();
};

/*
 * 发送内容为文字的消息
 */
Chat.prototype.say = function() {
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
        // 发送到服务器
        this.connect.send(letter);
    }
};


/*
 * 发送图片消息
 */
Chat.prototype.sayUpload = function(data){
    //#TODO上传图片封装给服务器
    var letter = {
        type: 'message',
        content:{
            type: "image",
            fid:data.fid,
        },
        from: data.from,
        to: data.to, 
    }
    console.log('传过去图片：',letter);
    this.connect.send(letter);
}

/*
 * 客服断开连接
 */
Chat.prototype.sayEnd = function(data){
     var letter = {
         type : 'kill_user',
         customer_id : data.to,
         uids : data.from,
    }
    console.log('kill user的消息',letter);
    this.connect.send(letter);
    //客服想关就关
    delete chat.users[data.from];
    localStorage.removeItem('csyouyun'+data.from);
}

Chat.prototype.sayExit = function(){
     var letter = {
         type : "leavecs",
         customer_id: chat.signinuser.username,
     }
     this.connect.send(letter);
}

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
var connect = new Connect(chat);
chat.connect = connect;
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

// 聊天框显示出最新的
function msgScrollEnd() {
    msg_end[0].scrollIntoView();
}

/**
 * 插入即时聊天客服的消息
 * 一条消息需要名字,时间,头像,内容
 * @return {[type]} [description]
 */
function insertChatMsgRight(message) {
    var date = new Date();
    var clone = chatMsgRight.clone();
    clone.find(".direct-chat-timestamp").html((new Date()).toLocaleTimeString());
    clone.find(".dctr").html(message);
    msg_end.before(clone);
}

/**
 * 插入即时聊天用户的消息
 * @return {[type]} [description]
 */
function insertChatMsgLeft(message) {
    var date = new Date();
    var clone = chatMsgLeft.clone();
    clone.find(".direct-chat-timestamp").html(date.toLocaleTimeString());
    clone.find(".dctl").html(message.content);
    clone.find('img#chatWindow-avatar').attr('src',chat.users[message.from].ext_content.pic);
    msg_end.before(clone);
}

/*
 * 插入历史记录客服的消息
 */
function insertChatHistoryRight(message){
    var date = new Date();
    date.setTime(message.createTime)
    var clone = chatMsgRight.clone();
    $(".direct-chat-timestamp",clone).html(date.toLocaleTimeString());
    $(".dctr",clone).html(message.content);
    msg_start.prepend(clone)
    
}

/*
 * 插入劣势记录客户的消息
 */
function insertChatHistoryLeft(message){
    var date = new Date();
    date.setTime(message.createTime)
    var clone = chatMsgLeft.clone();
    clone.find(".direct-chat-timestamp").html(date.toLocaleTimeString());
    clone.find(".dctl").html(message.content);
    clone.find('img#chatWindow-avatar').attr('src',chat.users[message.userId].ext_content.pic);
    msg_start.prepend(clone);
}
/*
 * 发送消息，通过消息类型转化为通用的格式以待插入聊天框
 */
function sendSpecifyMessageType(message){
    //#TODO:统一进行发消息时的组装，现在暂时用不同方法
}

/*
 * 获取消息，通过消息类型转化为通用的格式以待插入聊天框
 */
function getSpecifyMessageType(message){
    console.log('in getSpecifyMessageType',message);
    switch(message.content.type){
        case 'image':
            console.log('消息是图片');
            var clone = chatMsgImage.clone();
            clone.find('img').attr("data-original", message.content.image_url);
            clone.find('img').attr("src",message.content.image_thumb);
            message.content = clone;
            break;
        default:
            console.log('消息是文字');
            message.content = message.content.content;
    }
    console.log('转化后的消息格式',message);
    return message;
}


module.exports = chat;
