/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var middle = __webpack_require__(1);
	var chatApp = __webpack_require__(2);
	var mycookie = __webpack_require__(7);
	var chat = __webpack_require__(3);
	var Connect = __webpack_require__(5);

	var userAvatarComponent = __webpack_require__(8);
	middle.userAvatarComponent = userAvatarComponent;

	$(function() {
	    $('#exit').click(function(){
	         if(confirm("确定要退出吗？")){
	             chat.sayExit();
	             mycookie.delCookie('loginGid');
	             mycookie.delCookie('loginCid');
	             mycookie.delCookie('loginToken');
	             window.location.reload();
	         }
	        
	    });
	    /*
	     * 声音switch
	     */
	    $("[name='my-checkbox']").bootstrapSwitch({
	        size: 'small',
	        onColor: 'success',
	        onText: '开启',
	        offText: '关闭',
	        onSwitchChange: function(event, state) {
	            console.log(state);
	            chat.settingMsgSoundPrompt();
	        }
	    });
	    
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	//  持有 后端 和前台渲染的公共变量
	//  解决互相依赖导致某些前端渲染被超前执行
	var middle = {
	'connect' : null, //当前连接
	'my_connect' : null, //连接状态
	'my_connect_hint': '',//连接错误提示
	'heartBeatFlag' : null, //心跳器
	'heartBeatTimer' : 0, //重连次数
	'currentUserDom': document, //当前开启的窗口
	};


	module.exports = middle;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var middle = __webpack_require__(1);
	var chat = __webpack_require__(3);
	var config = __webpack_require__(4);
	var Connect = __webpack_require__(5);
	var mycookie = __webpack_require__(7);
	var chatApp = angular.module('chatApp', []);

	chatApp.controller('sign', function($scope, $http) {
	    var connect = new Connect(chat);
	    middle.connect = connect;
	    chat.connect = connect;
	    if(mycookie.getCookie('loginToken')){
	        var loginGid = mycookie.getCookie('loginGid');
	        var loginCid = mycookie.getCookie('loginCid');
	        var loginToken = mycookie.getCookie('loginToken');
	        //初始化chat信息
	        chat.signinuser.username = loginCid;
	        //chat.users.push($scope.username);
	        //chat.currentChat.theUser = $scope.username;
	        //chat.currentChat.username = $scope.username;
	        //chat.currentChat.chatname = $scope.username;
	        //构造websocket通讯地址
	        var jsonStr = '{"group_id":"'+ loginGid +'","customer_id":"' + loginCid + '","token":"'+ loginToken +'"}';
	        var socketData = window.btoa(jsonStr);
	        var socketUrl = config.api.communication_server_host +"?data="+ socketData;
	        var socketRes = connect.connect(socketUrl);
	    }else{
	          /*
	         * 登录浮层
	         */
	        $("#init").modal('show');
	        $scope.username = '13522480935';
	        $scope.password = '123456';
	        $scope.signUser = function() {
	            if(undefined === $scope.username || $scope.username.trim() === ''){
	                alert('请输入用户名');
	                return false;
	            }
	            if(undefined === $scope.password || $scope.password.trim() === ''){
	                alert('请输入密码');
	                return false;
	            }
	            $.ajax({
	              url: config.api.login,
	              data: "phone_number="+$scope.username+"&password="+$scope.password,
	              dataType:'jsonp',
	              jsonp:'json_callback',
	              jsonpCallback:"success_jsonpCallback",
	              success: function(data){
	                  if(1 == data.api_status){
	                      console.log(data)
	                      //初始化chat信息
	                      chat.signinuser.username = data.result.customer_id;
	                      //chat.users.push($scope.username);
	                      //chat.currentChat.theUser = $scope.username;
	                      //chat.currentChat.username = $scope.username;
	                      //chat.currentChat.chatname = $scope.username;
	                      //构造websocket通讯地址
	                      var jsonStr = '{"group_id":"'+ data.result.group_id +'","customer_id":"' + data.result.customer_id + '","token":"'+ data.result.token +'"}';
	                      var socketData = window.btoa(jsonStr);
	                      var socketUrl = config.api.communication_server_host +"?data="+ socketData;
	                      var socketRes = connect.connect(socketUrl);
	                      $("#init").modal('hide');
	                      //设置cookie
	                      mycookie.setCookie('loginGid',data.result.group_id);
	                      mycookie.setCookie('loginCid',data.result.customer_id);
	                      mycookie.setCookie('loginToken',data.result.token);
	                  }else{
	                      alert('验证失败，请重新登录');
	                  }
	              },
	              error:function(){
	                  alert('网络出现问题，请稍后尝试。');
	              }
	           });
	        };
	    }
	});

	module.exports = chatApp;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(4);
	var Connect = __webpack_require__(5);
	var middle = __webpack_require__(1);

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
	    } else {
	        console.log('userdom是',data.from);
	        middle.currentUserDom = userDom
	    }
	    //更新用户资料
	    $.ajax({
	      url: config.api.kupai_userinfo,
	      data: "uid="+ data.from,
	      type: 'get',
	      dataType:'jsonp',
	      jsonp:'json_callback',
	      jsonpCallback:"success_jsonpCallback",
	      success: function(res){
	          if(1 == res.api_status){
	            console.log('库拍个人信息',res.result)
	            $("#users-info #nick").html(res.result.nick);
	            $("#users-info #uid").html(res.result.uid);
	            $("#users-info #phoneNum").html(res.result.phoneNum);
	            $("#users-info #prvalue").html(res.result.prvalue);
	            $("#users-info #sumCount").html(parseInt(res.result.dealCount+res.result.schoolCount));
	            $("#users-info #dealCount").html(parseInt(res.result.dealCount));
	            $("#users-info #schoolCount").html(parseInt(res.result.schoolCount));
	          }else{
	               alert('获取用户信息失败')
	          }
	      },
	      error:function(){
	          alert('获取用户信息失败')
	          console.log('获取用户信息失败');
	      }
	    });
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


	module.exports = chat;


/***/ },
/* 4 */
/***/ function(module, exports) {

	/*
	 * 此文件为客服工作台所需要的所有接口。
	 * 根据env变量（从pm2传过来，由controller/home中转到index.html,再由js接收）来判断不同环境的不同调用接口。
	 */
	var communication_server_host = '';
	var upload = '';
	var history = '';
	var login = '';

	switch(env){
	     case 'production':
	        communication_server_host = 'ws://csws.17youyun.com/websocket';
	        upload = 'http://csapi.17youyun.com/fileProcess/custUploadFile';
	        history = 'http://csapi.17youyun.com/history/getHistory';
	        login = 'http://csapi.17youyun.com/customer/login';
	        kupai_userinfo = 'http://csapi.17youyun.com/customer/user_info/show'
	        break;
	     case 'development':
	        communication_server_host = 'ws://test.csws.17youyun.com/websocket';
	        upload = 'http://test.csapi.17youyun.com/fileProcess/custUploadFile';
	        history = 'http://test.csapi.17youyun.com/history/getHistory';
	        login = 'http://test.csapi.17youyun.com/customer/login';
	        kupai_userinfo = 'http://test.csapi.17youyun.com/customer/user_info/show'
	        break;
	     case 'test':
	        communication_server_host = 'ws://test.csws.17youyun.com/websocket';
	        upload = 'http://test.csapi.17youyun.com/fileProcess/custUploadFile';
	        history = 'http://test.csapi.17youyun.com/history/getHistory';
	        login = 'http://test.csapi.17youyun.com/customer/login';
	        kupai_userinfo = 'http://test.csapi.17youyun.com/customer/user_info/show'
	        break;
	     default://默认用正式的
	        communication_server_host = 'ws://csws.17youyun.com/websocket';
	        upload = 'http://csapi.17youyun.com/fileProcess/custUploadFile';
	        history = 'http://csapi.17youyun.com/history/getHistory';
	        login = 'http://csapi.17youyun.com/customer/login';
	     
	}

	var my_config = {
	    api:{
	        // 通讯服务器地址
	        communication_server_host: communication_server_host,
	        upload: upload,
	        history: history,
	        login: login,
	        kupai_userinfo: kupai_userinfo,
	    },
	    avatar:{
	        kf:'/public/app/img/avatar/kfavatar.png',
	        kr:'/public/app/img/avatar/kravatar.gif'
	    },
	    name:{
	        kf:'默认客服',
	        kr:'默认客人',  
	    },
	};

	module.exports = my_config;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Pubsub = __webpack_require__(6);
	var middle = __webpack_require__(1);
	var config = __webpack_require__(4);
	var mycookie = __webpack_require__(7);

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


/***/ },
/* 6 */
/***/ function(module, exports) {

	function Pubsub() {
	    this.handlers = {};
	}

	Pubsub.prototype = {
	    on: function(eventType, handler) {
	        var self = this;
	        if (!(eventType in self.handlers)) {
	            self.handlers[eventType] = [];
	        }
	        self.handlers[eventType].push(handler);
	        return this;
	    },
	    // 在emit 方法中 会回调 on 中设置的方法 ()
	    emit: function(eventType) {
	        var self = this;
	        if (self.handlers[eventType] !== undefined) {
	            var handlerArgs = arguments.slice(1);
	            for (var i = 0; i < self.handlers[eventType].length; i++) {
	                // 调用方法传递参数
	                // 参数都来自于发出事件时的参数
	                self.handlers[eventType][i].apply(self, handlerArgs);
	            }
	        } else {
	            // 没有此事件的监听者
	        }
	        return this;
	    },
	    addEvent: function(eventType) {
	        if (!(eventType in this.handlers)) {
	            this.handlers[eventType] = [];
	        }
	        return this;
	    }
	};

	module.exports = Pubsub;


/***/ },
/* 7 */
/***/ function(module, exports) {

	function Mycookie(){
	    
	}
	/*
	 * 设置cookie
	 */
	Mycookie.prototype.setCookie = function(name,value)
	{
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days*24*60*60*1000);
	document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
	}

	/*
	 * 读取cookie
	 */
	Mycookie.prototype.getCookie = function(name)
	{
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
	return unescape(arr[2]);
	else
	return null;
	}

	/*
	 * 删除cookie
	 */
	Mycookie.prototype.delCookie = function(name)
	{
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval= this.getCookie(name);
	if(cval!=null)
	document.cookie= name + "="+cval+";expires="+exp.toGMTString();
	}

	var mycookie = new Mycookie();
	module.exports = mycookie;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var chat = __webpack_require__(3);
	var userAvatarComponent = {
	    userListScope: null
	};

	// angular 好像使用不了map
	angular.module('chatApp').component('userList', {
	    template: `<div class='user-list'>
	                  <div class='user-list-item' ng-click='toggleChat(user,$event)' ng-repeat='user in users'>
	                      <span>{{user.ext_content.name}}</span>
	                      <span class="badge">{{user.unreadMsgCount}}</span>
	                  </div>
	                </div>`,
	    controller: function UserListController($scope) {
	        // 使用scope 是因为 在外界改变了 users 的值 为了使用 $scope.$apply方法å
	        //构造干净的遍历数据
	        $scope.users = chat.users;
	        userAvatarComponent.userListScope = $scope;
	        
	        var storage = window.localStorage;
	        for(i in storage){
	            if("csyouyun" == i.substring(0,8)){
	                var key = JSON.parse(storage[i]).from;
	                chat.users[key] = JSON.parse(storage[i]);
	                chat.usersMap.set(key, JSON.parse(storage[i]));//为了更新未读数埋的数据
	            }
	        }
	        
	        $scope.toggleChat = function(user,event) {
	            //点击用户时只有这个用户反色，其他的置灰
	            $(".user-list-item").css('background-color','#999999');
	            $(".user-list-item").css('border-bottom-color','#999999');
	            $(event.delegateTarget).css('background-color','#f2f2f2');
	            $(event.delegateTarget).css('border-bottom-color','#f2f2f2');
	            
	            console.log('当前窗口切换到用户',user.from);
	            chat.currentChat.username = user.from;
	            chat.currentChat.theUser = user;
	            chat.toggleChatView(user);
	            user.unreadMsgCount = null;
	        };
	    }
	});

	module.exports = userAvatarComponent;


/***/ }
/******/ ]);