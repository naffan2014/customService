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

	var chat = __webpack_require__(3);
	var userAvatarComponent = __webpack_require__(7);
	middle.userAvatarComponent = userAvatarComponent;

	$(function() {
	    /*
	     * 登录浮层
	     */
	    $("#init").modal('show');

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


	var middle = {};

	middle.my_connect = null;
	module.exports = middle;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var middle = __webpack_require__(1);
	var chat = __webpack_require__(3);
	var config = __webpack_require__(4);
	var Connect = __webpack_require__(5);

	var chatApp = angular.module('chatApp', []);

	chatApp.controller('sign', function($scope, $http) {
	    $scope.username = '210000';
	    $scope.signUser = function() {

	        if (undefined === $scope.username || $scope.username.trim() === '') {
	            alert('请输入客服标示');
	        } else {
	            $("#init").modal('hide');
	            chat.signinuser.username = $scope.username;
	            //chat.signIn($scope.username);
	            var connect = new Connect(chat);
	            chat.connect = connect;
	            // 连接server
	            var jsonStr = '{"group_id":"111111","customer_id":"'+$scope.username+'"}';
	            //初始化chat信息
	            //chat.users.push($scope.username);
	            //chat.currentChat.theUser = $scope.username;
	            //chat.currentChat.username = $scope.username;
	            //chat.currentChat.chatname = $scope.username;
	            //构造websocket通讯地址
	            var socketData = window.btoa(jsonStr);
	            var socketUrl = config.api.communication_server_host +"?data="+ socketData;
	            connect.connect(socketUrl);
	            //chat.refreshUserList();
	            //setInterval(function(){chat.say()}, 5000);
	        }
	        
	        
	    };


	});

	module.exports = chatApp;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(4);
	var Connect = __webpack_require__(5);
	var middle = __webpack_require__(1);

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
	        userDom.find('#chatWindow-username').html(this.users[data.from].ext_content.name);
	    } else {
	        console.log('userdom is not null');
	    }
	    //只需要在这里绑定窗口中的按钮事件，updateChatView则不用，因为都会走这个方法。
	    userDom.find('#msg-input').on('keydown', function(event) {
	        if (event.ctrlKey && event.keyCode == 13) {
	            // 回车
	            chat.say();
	        }
	    });
	    userDom.find('#say').click(function() {
	         chat.say();
	    });
	    //绑定上传图片
	    var tmpTimestamp = Date.parse(new Date());
	     userDom.find('#imageUpload').ajaxfileupload({
	      action: config.api.upload,
	      valid_extensions : ['jpeg','gif','png','jpg'],
	      params: {
	        'from':data.to,
	        'to':data.from,
	        //'fid':data.to+ '-' + data.from +'-'+ tmpTimestamp,//210000-547240-1482758314000
	        'fid':210000-547240-1482758314000
	      },
	      onComplete: function(response) {
	        console.log('上传图片成功:',response);
	        if(response.result = 1){
	            var clone = chatMsgImage.clone();
	            clone.find('img').attr("data-original", "http://bpic.588ku.com/element_origin_min_pic/16/12/15/2c68d0b69c867cf3d4b046a02fc0a65d.jpg");
	            clone.find('img').attr("src", "http://bpic.588ku.com/element_origin_min_pic/16/12/18/2b17c25c340f388835ddf2646aa0afb6.jpg");
	            insertChatMsgRight(clone);
	            var uploadData = {
	                from:data.to,
	                to:data.from,
	                fid:'547240-549341-19',
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
	 * 自己的消息
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
	 * 对方的消息
	 * @return {[type]} [description]
	 */
	function insertChatMsgLeft(data) {
	    var date = new Date();
	    var clone = chatMsgLeft.clone();
	    clone.find(".direct-chat-timestamp").html((new Date()).toLocaleTimeString());
	    clone.find(".dctl").html(data.content);
	    clone.find('img#chatWindow-avatar').attr('src',chat.users[data.from].ext_content.pic);
	    msg_end.before(clone);
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
	    console.log('in getSpecifyMessageType');
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
	    console.log('转化后的消息格式');
	    console.log(message);
	    return message;
	}


	module.exports = chat;


/***/ },
/* 4 */
/***/ function(module, exports) {

	var my_config = {
	    api:{
	        // 通讯服务器地址
	        //communication_server_host: window.location.href
	        //communication_server_host: 'ws://10.0.8.101:8081/websocket?data=eyJncm91cF9pZCI6IjIyMjIyMiIsImN1c3RvbWVyX2lkIjoiMTExMTExIiwidG9rZW4iOiJjZjRmZDg4OGI1MjhlNzkzMzMyZGMyMTM1NGU4OTJlYjMyYTA1ZWE3ZTM0OGZiNmVmOTJjYjJhNGQyNTg5MTlmIn0='
	        communication_server_host: 'ws://10.0.8.91:8097/websocket',
	        // communication_server_host: 'ws://192.168.33.191:8097/websocket?data=eyJncm91cF9pZCI6IjIyMjIyMiIsImN1c3RvbWVyX2lkIjoiMTExMTExIiwidG9rZW4iOiJjZjRmZDg4OGI1MjhlNzkzMzMyZGMyMTM1NGU4OTJlYjMyYTA1ZWE3ZTM0OGZiNmVmOTJjYjJhNGQyNTg5MTlmIn0='
	        upload: 'http://10.0.8.91:8096/fileProcess/custUploadFile',
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
	        //public_chat.toggleChatView(public_chat.users);//连接服务器后显示聊天窗口
	    };

	    this.socket.onclose = function (obj) {
	    //已经关闭连接
	    console.log("已断开到服务器");
	    alert('请检查服务器，服务器未开启')
	    };
	    
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
	        console.log("socket产生异常",obj);
	    }; 
	};

	/*
	 * 发送消息
	 */
	Connect.prototype.deliver = function(letter) {
	    this.socket.send(JSON.stringify(letter));
	    console.log('发出的消息是',JSON.stringify(letter));
	};

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
/***/ function(module, exports, __webpack_require__) {

	var chat = __webpack_require__(3);
	var userAvatarComponent = {
	    userListScope: null
	};

	// angular 好像使用不了map
	angular.module('chatApp').component('userList', {
	    template: `<div class='user-list'>
	                  <div class='user-list-item' ng-click='toggleChat(user)' ng-repeat='user in users'>
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
	        
	        
	        $scope.toggleChat = function(user) {
	            console.log('useravatar.component中的function中的user');
	            console.log(user)
	            chat.currentChat.username = user.from;
	            chat.currentChat.theUser = user;
	            console.log(chat.currentChat)
	            chat.toggleChatView(user);
	            user.unreadMsgCount = null;
	        };
	    }
	});

	module.exports = userAvatarComponent;


/***/ }
/******/ ]);