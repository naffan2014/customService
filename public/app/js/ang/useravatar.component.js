var chat = require('../chat');
var userAvatarComponent = {
    userListScope: null
};

// angular 好像使用不了map
angular.module('chatApp').component('userList', {
    template: `<div class='user-list'>
                  <div class='user-list-item' ng-click='toggleChat(user)' ng-repeat='user in users'>
                      <span>{{user.from}}</span>
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
