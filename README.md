>这个项目如果你直接clone下来，是不能正常的工作的。因为他缺少服务端的支持，具体为什么不用nodejs做服务端请看我的个人博客中[通过nodejs搭建客服系统还有闲谈](http://naffan.cn/tech/2017/01/25/1.html)一文。如果你想要快速的独立做出客服系统的话，你可以直接clone下来这些代码，因为这些代码已经实现了作为客服系统所应有的功能，你只需要去配置文件以及ajax接口的地方更改成你服务器上的地址即可。至于，服务器返回的格式请参考这个项目的wiki

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
