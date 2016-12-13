var chat = require('../chat');
var userAvatarComponent = {
    userListScope: null
};

// angular 好像使用不了map
angular.module('chatApp').component('userList', {
    template: `<div class='user-list'>
                  <div class='user-list-item' ng-click='toggleChat(user)' ng-repeat='user in users'>
                      <img class="user-avatar" ng-src='{{user.avatar}}' alt="" />
                      <span>{{user.username}}</span>
                      <span class="badge">{{user.unreadMsgCount}}</span>
                  </div>
                </div>`,
    controller: function UserListController($scope) {

        // 使用scope 是因为 在外界改变了 users 的值 为了使用 $scope.$apply方法
        $scope.users = chat.users;
        userAvatarComponent.userListScope = $scope;
        $scope.toggleChat = function(user) {
            chat.currentChat.username = user.username;
            chat.currentChat.theUser = user;
            chat.toggleChatView(user);
            user.unreadMsgCount = null;
        };
    }
});

module.exports = userAvatarComponent;
