/*
 * 此文件为客服工作台所需要的所有接口。
 * 根据env变量（从pm2传过来，由controller/home中转到index.html,再由js接收）来判断不同环境的不同调用接口。
 */
var communication_server_host = '';
var upload = '';
var history = '';
var login = '';

switch(env){
     case 'production':
        communication_server_host = 'ws://ws.cs.51kupai.com/websocket';
        upload = 'http://api.cs.51kupai.com/fileProcess/custUploadFile';
        history = 'http://api.cs.51kupai.com/history/getHistory';
        login = 'http://api.cs.51kupai.com/customer/login';
        kupai_userinfo = 'http://api.cs.51kupai.com/customer/user_info/show';
        update_online_statue = 'http://admin.cs.51kupai.com/api/seating/updateSeatingInfo';
        break;
     case 'development':
        communication_server_host = 'ws://test.ws.cs.51kupai.com/websocket';
        upload = 'http://test.api.cs.51kupai.com/fileProcess/custUploadFile';
        history = 'http://test.api.cs.51kupai.com/history/getHistory';
        login = 'http://test.api.cs.51kupai.com/customer/login';
        kupai_userinfo = 'http://test.api.cs.51kupai.com/customer/user_info/show';
        update_online_statue = 'http://test.admin.cs.51kupai.com/api/seating/updateSeatingInfo';
        break;
     case 'test':
        communication_server_host = 'ws://test.ws.cs.51kupai.com/websocket';
        upload = 'http://test.api.cs.51kupai.com/fileProcess/custUploadFile';
        history = 'http://test.api.cs.51kupai.com/history/getHistory';
        login = 'http://test.api.cs.51kupai.com/customer/login';
        kupai_userinfo = 'http://test.api.cs.51kupai.com/customer/user_info/show';
        update_online_statue = 'http://test.admin.cs.51kupai.com/api/seating/updateSeatingInfo';
        break;
     default://默认用正式的
        communication_server_host = 'ws://ws.cs.51kupai.com/websocket';
        upload = 'http://api.cs.51kupai.com/fileProcess/custUploadFile';
        history = 'http://api.cs.51kupai.com/history/getHistory';
        login = 'http://api.cs.51kupai.com/customer/login';
        update_online_statue = 'http://admin.cs.51kupai.com/api/seating/updateSeatingInfo';
     
}

var my_config = {
    api:{
        // 通讯服务器地址
        communication_server_host: communication_server_host,
        upload: upload,
        history: history,
        login: login,
        kupai_userinfo: kupai_userinfo,
        update_online_statue: update_online_statue,
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
