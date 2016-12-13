function Pubsub() {
  this.handlers = {};
}

Pubsub.prototype = {
  on: function(eventType, handler) {
    var self = this;
    if (!(eventType in self.handlers)) {
      self.handlers[eventType] = [];
    }
    self.handlers[eventType].push(handler);
    return this;
  },
  emit: function(eventType) {
    var self = this;
    if (self.handlers[eventType] != undefined) {
      var handlerArgs = arguments.slice(1);
      for (var i = 0; i < self.handlers[eventType].length; i++) {
        // 调用方法传递参数
        // 参数都来自于发出事件时的参数
        self.handlers[eventType][i].apply(self, handlerArgs);
      }
    } else {
      // 没有此事件的监听者
    }
    return this;
  },
  addEvent: function(eventType) {
    if (!(eventType in this.handlers)) {
      this.handlers[eventType] = [];
    }
    return this;
  }
};

var pubsub = new Pubsub();
// 初始化事件
pubsub.addEvent("signin");
pubsub.addEvent("signout");
pubsub.addEvent("msgfromUser");

module.exports=pubsub;
