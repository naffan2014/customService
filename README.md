# socketio-chat
nodejs 和 socketio 实现的 聊天窗口


#启动说明：
node采用pm2来启动。配置文件是根目录的ecosystem.config.js。这个文件里面规定了不同环境的不同环境变量（详情请看这个文件的配置）
启动方法：
pm2 start ecosystem.config.js --env production(生产环境，这个参数就是所采用的环境)。

例如：
1.本机测试：
pm2 start ecosystem.config.js --env test
2.测试服务器：
pm2 start ecosystem.config.js --env development

#开发说明：
采用webpack技术对js进行引用。如果你需要更改js并看效果，建议你开启--watch参数
启动方法：
webpack --watch