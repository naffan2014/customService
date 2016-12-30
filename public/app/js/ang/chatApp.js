var middle = require('../middle');
var chat = require('../chat');
var config = require('../config');
var Connect = require('../connect');
var mycookie = require('../cookie');
var chatApp = angular.module('chatApp', []);

chatApp.controller('sign', function($scope, $http) {
    var connect = new Connect(chat);
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
        $scope.username = '13522480935';
        $scope.password = '123456';
        $("#init").modal('hide');
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
                  if('success' == data.api_status){
                      //设置cookie
                      mycookie.setCookie('loginGid',data.result.group_id);
                      mycookie.setCookie('loginCid',data.result.customer_id);
                      mycookie.setCookie('loginToken',data.result.token);
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
                  }else{
                      alert('登录失败')
                      return false;
                  }
              },
              error:function(){
                  alert('进了error');
              }
           });
        };
    }
});

module.exports = chatApp;
