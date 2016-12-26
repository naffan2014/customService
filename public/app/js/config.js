var my_config = {
    api:{
        // 通讯服务器地址
        //communication_server_host: window.location.href
        //communication_server_host: 'ws://10.0.8.101:8081/websocket?data=eyJncm91cF9pZCI6IjIyMjIyMiIsImN1c3RvbWVyX2lkIjoiMTExMTExIiwidG9rZW4iOiJjZjRmZDg4OGI1MjhlNzkzMzMyZGMyMTM1NGU4OTJlYjMyYTA1ZWE3ZTM0OGZiNmVmOTJjYjJhNGQyNTg5MTlmIn0='
        communication_server_host: 'ws://10.0.8.91:8097/websocket',
        // communication_server_host: 'ws://192.168.33.191:8097/websocket?data=eyJncm91cF9pZCI6IjIyMjIyMiIsImN1c3RvbWVyX2lkIjoiMTExMTExIiwidG9rZW4iOiJjZjRmZDg4OGI1MjhlNzkzMzMyZGMyMTM1NGU4OTJlYjMyYTA1ZWE3ZTM0OGZiNmVmOTJjYjJhNGQyNTg5MTlmIn0='
        upload: 'http://10.0.8.91:8096/fileProcess/custUploadFile',
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
