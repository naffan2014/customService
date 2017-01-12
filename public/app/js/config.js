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
        communication_server_host = 'ws://csws.17youyun.com/websocket';
        upload = 'http://csapi.17youyun.com/fileProcess/custUploadFile';
        history = 'http://csapi.17youyun.com/history/getHistory';
        login = 'http://csapi.17youyun.com/customer/login';
        break;
     case 'development':
        communication_server_host = 'ws://test.csws.17youyun.com/websocket';
        upload = 'http://test.csapi.17youyun.com/fileProcess/custUploadFile';
        history = 'http://test.csapi.17youyun.com/history/getHistory';
        login = 'http://test.csapi.17youyun.com/customer/login';
        break;
     case 'test':
        communication_server_host = 'ws://test.csws.17youyun.com/websocket';
        upload = 'http://test.csapi.17youyun.com/fileProcess/custUploadFile';
        history = 'http://test.csapi.17youyun.com/history/getHistory';
        login = 'http://test.csapi.17youyun.com/customer/login';
        break;
     default://默认用正式的
        communication_server_host = 'ws://csws.17youyun.com/websocket';
        upload = 'http://csapi.17youyun.com/fileProcess/custUploadFile';
        history = 'http://csapi.17youyun.com/history/getHistory';
        login = 'http://csapi.17youyun.com/customer/login';
     
}

var my_config = {
    api:{
        // 通讯服务器地址
        communication_server_host: communication_server_host,
        upload: upload,
        history: history,
        login: login,
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
