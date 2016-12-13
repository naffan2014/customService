/**
 * 一个人的message 应该受 server 约束,并不能自由
 */

var message = {
    channelid: null,
    sendUser: null,
    receiveUser:null,
    content: null,
    messageid:null,
    type:null  // one 一对一聊天  some 群聊
};
