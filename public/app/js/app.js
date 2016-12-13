var middle = require('./middle');
var chatApp = require('./ang/chatapp');

var chat = require('./chat');
var userAvatarComponent = require('./ang/useravatar.component');
middle.userAvatarComponent = userAvatarComponent;

$(function() {

    $("#init").modal('show');

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
