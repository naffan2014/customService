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
        userDom.find('#chatWindow-username').html(this.users[data.from].ext_content.name);
        $('#closeChat',userDom).attr('closeid',data.from);
        chat.chatWindowDom.set(data.from, userDom);
     }
     
     //当涉及多个人会话时userDom会变成当前未激活窗口的用户,所以我们要临时将当前激活的存起来，完成这个事件以后再归还
     var msg_start = (msg_start != undefined)?msg_start:'';
     var msg_input_tmp = msg_input;
     var msg_start_tmp = msg_start;
     var msg_end_tmp =  msg_end;
     msg_input = userDom.find("#msg-input");
     msg_start = userDom.find("#box-body");
     msg_end = userDom.find("#msg_end");
     insertChatMsgLeft(data);
     //归还
     msg_input = msg_input_tmp;
     msg_start = msg_start_tmp;
     msg_end = msg_end_tmp;
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
        $('#closeChat',userDom).attr('closeid',data.from);
    } else {
        console.log('userdom是',data.from);
        middle.currentUserDom = userDom
    }
    //更新用户信息
    getKuPaiUserInfo(data.from)
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
                file_length_byte:responseData.result.fileLengthByte,
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
            closeid = $(this).attr('closeid');
            data.from = closeid;
            chat.sayEnd(data);
        }
        return false;
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
 * 心跳
 */
Chat.prototype.heartBeat = function(kfid){
    var letter = {
        type:'heartBeat',
        customer_id:kfid,
        message: 1,
    }
    // 发送到服务器
    this.connect.send(letter);
}

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
            file_length_byte:data.file_length_byte,
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

    $('#informationTabBody').html('');
    $('#informationTabHead').html('');
    $('#informationModalBody').html('');
    
    var chat = this;
    var closePosition =  Object.keys(chat.users).indexOf(data.from);
    
    var appearPositionStart = closePosition+1;
    var appearPositionEnd = closePosition+2;
    var appearId = Object.keys(chat.users).slice(appearPositionStart,appearPositionEnd);
    if("" == appearId){
        //没有下一个就需要给出默认的窗体
        var userDom = chat.chatWindow.clone();
        $('#chatWindowDiv').replaceWith(userDom);
    }else{
        //有下一个就需要
        var userDom = chat.chatWindowDom.get(appearId.toString());
        if(userDom === undefined || userDom === null){
             userDom = chat.chatWindow.clone();
        }
        middle.currentUserDom = userDom
        $('#chatWindowDiv').replaceWith(userDom);
        
        //更新库拍用户信息
        getKuPaiUserInfo(uid)
    }
    
    var forConnect = JSON.parse(localStorage.getItem('csyouyun'+data.from));
    if(0 != forConnect.connect){
        var letter = {
             type : 'kill_user',
             customer_id : data.to,
             uids : data.from,
        }
        console.log('kill user的消息',letter);
        this.connect.send(letter);
    }
    //客服想关就关
    delete chat.users[data.from];
    localStorage.removeItem('csyouyun'+data.from);
    middle.userAvatarComponent.userListScope.$apply();
}

Chat.prototype.sayExit = function(){
     var letter = {
         type : "off_line",
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

/*
 * 获取酷派用户的信息
 */
function getKuPaiUserInfo(uid){
    //更新用户资料 tyope: 1-用户 2-拍卖订单 3-主题订单
    $('#informationTabBody').html('');
    $('#informationTabHead').html('');
    $('#informationModalBody').html('');
    $.ajax({
      url: config.api.kupai_userinfo,
      data: "uid="+ uid,
      type: 'get',
      dataType:'jsonp',
      jsonp:'json_callback',
      jsonpCallback:"success_jsonpCallback",
      success: function(res){
          console.log('获取库拍个人信息信息',res)
          if(1 == res.api_status){
              var html = "";
              switch(parseInt(res.result.type)){
                  case 1:
                    //用户
                    html += '<div><span>昵称</span>:<span>'+res.result.data.nick+'</span></div>';
                    html += '<div><span>UID</span>:<span>'+res.result.data.uid+'</span></div>';
                    html += '<div><span>手机号</span>:<span>'+res.result.data.phoneNum+'</span></div>';
                    html += '<div><span>PR值</span>:<span>'+res.result.data.prvalue+'</span></div>';
                    html += '<div><span>成交笔数</span>:<span>'+parseInt(res.result.data.dealCount+res.result.data.schoolCount)+'</span></div>';
                    html += '<div><span>成交数</span>:<span>'+parseInt(res.result.data.dealCount)+'</span></div>';
                    html += '<div><span>流拍数</span>:<span>'+parseInt(res.result.data.schoolCount)+'</span></div>';
                    break;
                  case 2:
                    //拍卖订单
                    html += '<div><span>昵称</span>:<span>'+res.result.data.youyunUser.nick+'</span></div>';
                    html += '<div><span>UID</span>:<span>'+res.result.data.youyunUser.uid+'</span></div>';
                    html += '<div><span>手机号</span>:<span>'+res.result.data.youyunUser.phoneNum+'</span></div>';
                    html += '<div><span>PR值</span>:<span>'+res.result.data.youyunUser.prvalue+'</span></div>';
                    html += '<div><span>成交笔数</span>:<span>'+parseInt(res.result.data.youyunUser.dealCount+res.result.data.youyunUser.schoolCount)+'</span></div>';
                    html += '<div><span>成交数</span>:<span>'+parseInt(res.result.data.youyunUser.dealCount)+'</span></div>';
                    html += '<div><span>流拍数</span>:<span>'+parseInt(res.result.data.youyunUser.schoolCount)+'</span></div>';
                    html += '<div><span>拍卖名称</span>:<span>'+res.result.data.youyunBid.goodsName+'</span></div>';
                    html += '<div><span>拍卖状态</span>:<span>'+res.result.data.youyunBid.bidStatus+'</span></div>';
                    html += '<div><span>起拍价</span>:<span>'+res.result.data.youyunBid.initialPrice+'</span></div>';
                    html += '<div><span>用户实际出价</span>:<span>'+res.result.data.youyunBid.finalPrice+'</span></div>';
                    html += '<div><span>成交价</span>:<span>'+res.result.data.youyunBid.dealPrice+'</span></div>';
                    html += '<div><span>封顶成交价</span>:<span>'+res.result.data.youyunBid.topPrice+'</span></div>';
                    html += '<div><span>绝杀价</span>:<span>'+res.result.data.youyunBid.fusingPrice+'</span></div>';
                    switch(res.result.data.orderStatus){
                        case '待支付':
                            html += '<div><span>待支付剩余时间</span>:<span>'+res.result.data.leftTime+'</span></div>';
                            html += '<div><span>过了支付时间</span>:<span>'+payOverTime+'</span></div>';
                            break;
                        case '已支付待发货':
                            html += '<div><span>已支付时间</span>:<span>'+res.result.data.payTime+'</span></div>';
                            html += '<div><span>买受人地址</span>:<span>'+res.result.data.address+'</span></div>';
                            html += '<div><span>买受人电话</span>:<span>'+res.result.data.phone+'</span></div>';
                            html += '<div><span>此拍品送拍机构</span>:<span>'+res.result.data.youyunSupplier.name+'</span></div>';
                            html += '<div><span>机构联系电话</span>:<span>'+res.result.data.youyunSupplier.phone+'</span></div>';
                            break;
                        case '待收货':
                            html += '<div><span>已支付时间</span>:<span>'+res.result.data.payTime+'</span></div>';
                            html += '<div><span>买受人地址</span>:<span>'+res.result.data.address+'</span></div>';
                            html += '<div><span>买受人电话</span>:<span>'+res.result.data.phone+'</span></div>';
                            html += '<div><span>此拍品送拍机构</span>:<span>'+res.result.data.youyunSupplier.name+'</span></div>';
                            html += '<div><span>机构联系电话</span>:<span>'+res.result.data.youyunSupplier.phone+'</span></div>';
                            if($.isEmptyObject(res.result.data.traces)){
                                html += '<div><span>物流扭转状态</span>:<span></span></div>';
                            }else{
                                var htmlwlxx = '';
                                $.each(res.result.data.traces,function(index,domEle){
                                  htmlwlxx += '<div><span>'+res.result.data.traces[index].AcceptTime+'</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>'+res.result.data.traces[index].AcceptStation+'</span></div>';
                               });
                                $('#wlxx .informationModalBody').append(htmlwlxx);
                                html += '<div><span>物流扭转状态</span>:<span><button onclick="$(\'#wlxx\').modal(\'show\')">查看详情</button></span></div>';
                            }
                            break;
                        case '订单完成':
                            html += '<div><span>已支付时间</span>:<span>'+res.result.data.payTime+'</span></div>';
                            html += '<div><span>买受人地址</span>:<span>'+res.result.data.address+'</span></div>';
                            html += '<div><span>买受人电话</span>:<span>'+res.result.data.phone+'</span></div>';
                            html += '<div><span>此拍品送拍机构</span>:<span>'+res.result.data.youyunSupplier.name+'</span></div>';
                            html += '<div><span>机构联系电话</span>:<span>'+res.result.data.youyunSupplier.phone+'</span></div>';
                            if($.isEmptyObject(res.result.data.traces)){
                                html += '<div><span>物流扭转状态</span>:<span></span></div>';
                            }else{
                                var htmlwlxx = '';
                                $.each(res.result.data.traces,function(index,domEle){
                                  htmlwlxx += '<div><span>'+res.result.data.traces[index].AcceptTime+'</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>'+res.result.data.traces[index].AcceptStation+'</span></div>';
                               });
                                $('#wlxx .informationModalBody').append(htmlwlxx);
                                html += '<div><span>物流扭转状态</span>:<span><button onclick="$(\'#wlxx\').modal(\'show\')">查看详情</button></span></div>';
                            }
                            html += '<div><span>交易成功时间</span>:<span>'+res.result.data.receivingTime+'</span></div>';
                            break;
                        default:
                    }
                    break
                  case 3:
                    //主题订单
                    html += '<div><span>昵称</span>:<span>'+res.result.data.youyunUser.nick+'</span></div>';
                    html += '<div><span>UID</span>:<span>'+res.result.data.youyunUser.uid+'</span></div>';
                    html += '<div><span>手机号</span>:<span>'+res.result.data.youyunUser.phoneNum+'</span></div>';
                    html += '<div><span>PR值</span>:<span>'+res.result.data.youyunUser.prvalue+'</span></div>';
                    html += '<div><span>成交笔数</span>:<span>'+parseInt(res.result.data.youyunUser.dealCount+res.result.data.youyunUser.schoolCount)+'</span></div>';
                    html += '<div><span>成交数</span>:<span>'+parseInt(res.result.data.youyunUser.dealCount)+'</span></div>';
                    html += '<div><span>流拍数</span>:<span>'+parseInt(res.result.data.youyunUser.schoolCount)+'</span></div>';
                    html += '<div><span>商品名称</span>:<span>'+res.result.data.youyunGoods.commodityName+'</span></div>';
                    html += '<div><span>数量</span>:<span>'+res.result.data.amount+'</span></div>';
                    html += '<div><span>单价</span>:<span>'+res.result.data.youyunGoods.price+'</span></div>';
                    html += '<div><span>买家留言</span>:<span>'+res.result.data.remark+'</span></div>';
                    html += '<div><span>买家收货地址</span>:<span>'+res.result.data.address+'</span></div>';
                    html += '<div><span>收货姓名</span>:<span>'+res.result.data.receiveName+'</span></div>';
                    html += '<div><span>收货手机号</span>:<span>'+res.result.data.phone+'</span></div>';
                    html += '<div><span>买家昵称</span>:<span>'+res.result.data.youyunUser.nick+'</span></div>';
                    html += '<div><span>订单号</span>:<span>'+res.result.data.orderId+'</span></div>';
                    switch(res.result.data.orderStatus){
                        case '待支付':
                           // html += '<div><span>待支付金额</span>:<span>'++'</span></div>';
                            html += '<div><span>创建时间</span>:<span>'+res.result.data.createTime+'</span></div>';
                            html += '<div><span>关闭时间</span>:<span>'+res.result.data.payOverTime+'</span></div>';
                            break;
                        case '已支付待发货':
                            //html += '<div><span>总支付金额</span>:<span>'++'</span></div>';
                            html += '<div><span>创建时间</span>:<span>'+res.result.data.createTime+'</span></div>';
                            html += '<div><span>付款时间</span>:<span>'+res.result.data.payTime+'</span></div>';
                            html += '<div><span>距支付已过时间</span>:<span>'+res.result.data.rightTime+'</span></div>';
                     break;
                        case '待收货':
                            //html += '<div><span>总支付金额</span>:<span>'++'</span></div>';
                            html += '<div><span>创建时间</span>:<span>'+res.result.data.createTime+'</span></div>';
                            html += '<div><span>付款时间</span>:<span>'+res.result.data.payTime+'</span></div>';
                            html += '<div><span>发货时间</span>:<span>'+res.result.data.deliveryTime+'</span></div>';
                            if($.isEmptyObject(res.result.data.traces)){
                                html += '<div><span>物流扭转状态</span>:<span></span></div>';
                            }else{
                                var htmlwlxx = '';
                                $.each(res.result.data.traces,function(index,domEle){
                                  htmlwlxx += '<div><span>'+res.result.data.traces[index].AcceptTime+'</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>'+res.result.data.traces[index].AcceptStation+'</span></div>';
                               });
                                $('#wlxx .informationModalBody').append(htmlwlxx);
                                html += '<div><span>物流扭转状态</span>:<span><button onclick="$(\'#wlxx\').modal(\'show\')">查看详情</button></span></div>';
                            }
                            break;
                        case '订单完成':
                            //html += '<div><span>总支付金额</span>:<span>'++'</span></div>';
                            html += '<div><span>创建时间</span>:<span>'+res.result.data.createTime+'</span></div>';
                            html += '<div><span>付款时间</span>:<span>'+res.result.data.payTime+'</span></div>';
                            html += '<div><span>发货时间</span>:<span>'+res.result.data.deliveryTime+'</span></div>';
                            html += '<div><span>成交时间</span>:<span>'+res.result.data.receivingTime+'</span></div>';
                            break;
                        default:
                    }
                    break;
                  default:
                    html += '<div><span>昵称:</span><span>'+res.result.data.nick+'</span></div>';
                    html += '<div><span>UID:</span><span>'+res.result.data.uid+'</span></div>';
                    html += '<div><span>手机号:</span><span>'+res.result.data.phoneNum+'</span></div>';
                    html += '<div><span>PR值:</span><span>'+res.result.data.prvalue+'</span></div>';
                    html += '<div><span>成交笔数:</span><span>'+parseInt(res.result.data.dealCount+res.result.data.schoolCount)+'</span></div>';
                    html += '<div><span>成交数:</span><span>'+parseInt(res.result.data.dealCount)+'</span></div>';
                    html += '<div><span>流拍数:</span><span>'+parseInt(res.result.data.schoolCount)+'</span></div>';
              }
              $('#informationTabBody').html(html);
          }else{
              if(undefined == res.msg || "" == res.msg){
                  alert("未获取到数据，请联系服务提供商");
              }else{
                  alert(res.msg);
              }
          }
      }
    });
}
module.exports = chat;
