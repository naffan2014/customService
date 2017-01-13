//  持有 后端 和前台渲染的公共变量
//  解决互相依赖导致某些前端渲染被超前执行
var middle = {
'connect' : null, //当前连接
'my_connect' : null, //连接状态
'my_connect_hint': '',//连接错误提示
'heartBeatFlag' : null, //心跳器
'heartBeatTimer' : 0, //重连次数
'currentUserDom': document, //当前开启的窗口
};


module.exports = middle;
