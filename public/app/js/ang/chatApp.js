var middle = require('../middle');
var chat = require('../chat');
var config = require('../config');
var Connect = require('../connect');

var chatApp = angular.module('chatApp', []);

chatApp.controller('sign', function($scope, $http) {
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
            var jsonStr = "{group_id:111111,customer_id:"+$scope.username+"}";
            //初始化chat信息
            //chat.users.push($scope.username);
            //chat.currentChat.theUser = $scope.username;
            //chat.currentChat.username = $scope.username;
            //chat.currentChat.chatname = $scope.username;
            //构造websocket通讯地址
            var socketData = window.btoa(jsonStr);
            var socketUrl = config.communication_server_host +"?data="+ socketData;
            connect.connect(socketUrl);
            //chat.refreshUserList();
            //setInterval(function(){chat.say()}, 5000);
        }
        
        
    };


});

module.exports = chatApp;
