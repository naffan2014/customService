var middle = require('./middle');
var chatApp = require('./ang/chatapp');

var chat = require('./chat');
var userAvatarComponent = require('./ang/useravatar.component');
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
