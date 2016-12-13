//  持有 后端 和前台渲染的公共变量
//  解决互相依赖导致某些前端渲染被超前执行


var middle = {};

middle.my_connect = null;
module.exports = middle;
