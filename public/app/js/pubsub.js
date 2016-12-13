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
    // 在emit 方法中 会回调 on 中设置的方法 ()
    emit: function(eventType) {
        var self = this;
        if (self.handlers[eventType] !== undefined) {
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

module.exports = Pubsub;
