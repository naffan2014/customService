var middle = require('./middle');
var chatApp = require('./ang/chatapp');
var mycookie = require('./cookie');
var chat = require('./chat');
var Connect = require('./connect');
var config = require('./config');


var userAvatarComponent = require('./ang/useravatar.component');
middle.userAvatarComponent = userAvatarComponent;

$(function() {
    $('#exit').click(function(){
         if(confirm("确定要退出吗？")){
             var phone = mycookie.getCookie('phone');
             $.ajax({
                  url: config.api.update_online_statue,
                  data: "phone="+phone+"&online=0",
                  dataType:'jsonp',
                  jsonp:'json_callback',
                  jsonpCallback:"success_jsonpCallback",
                  success: function(res){
                      if(1 == res.api_status){
                          chat.sayExit();
                           mycookie.delCookie('loginGid');
                           mycookie.delCookie('loginCid');
                           mycookie.delCookie('loginToken');
                           mycookie.delCookie('phone');
                          window.location.reload();
                      }
                  }
             });
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
