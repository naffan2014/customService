var middle = require('./middle');
var chatApp = require('./ang/chatapp');
var mycookie = require('./cookie');
var chat = require('./chat');
var Connect = require('./connect');

var userAvatarComponent = require('./ang/useravatar.component');
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
