var middle = require('../middle');
var chat = require('../chat');
var config = require('../config');
var Connect = require('../connect');

var chatApp = angular.module('chatApp', []);

chatApp.controller('sign', function($scope, $http) {
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
          type: 'post',
          dataType:'jsonp',
          jsonp:'json_callback',
          jsonpCallback:"success_jsonpCallback",
          success: function(data){
              if('success' == data.api_status){
                  console.log(data)
                    chat.signinuser.username = $scope.username;
                    //chat.signIn($scope.username);
                    var connect = new Connect(chat);
                    chat.connect = connect;
                    // 连接server
                    var jsonStr = '{"group_id":"'+ data.result.group_id +'","customer_id":"' + data.result.customer_id + '","token":"'+ data.result.token +'"}';
                    //初始化chat信息
                    //chat.users.push($scope.username);
                    //chat.currentChat.theUser = $scope.username;
                    //chat.currentChat.username = $scope.username;
                    //chat.currentChat.chatname = $scope.username;
                    //构造websocket通讯地址
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
        $("#init").modal('hide');
    };
});

module.exports = chatApp;
