(function () {


    function isFunction(fn){
        return typeof fn === "function";
    }

    var defaultOption = {
        startIndex: 0, // 初始位置
        pits: 8,  // 当前位置
        interval: 100, // 初始间隔
        rate: 2.5,  // 系数
        cycle: 3,  //转动基本次数：即至少需要转动多少次再进入抽奖环节
        getInterval: null // 自定义旋转间隔函数
        //onStart: null, // 当开始
        //onUpdate: null, // 旋转一次
        //onEnded: null,  // 结束
        //onError: null  // 异常, 比如转动次数已经达到设定值, 但是没有设置奖项
    };

    var slice = Array.prototype.slice;

    function Lottery(options) {
        this.originOptions = options;
        this.options = Object.assign({}, defaultOption, options);

        // 定时器Id
        this.ticketId = null;
        // 奖项
        this.prizeIndexes = null;
        // 转动次数
        this.times = 0;
        // 当前位置
        this.index = 0;
        // 模拟结果
        this.animatingResult = false;
        // 实际的转动基本次数, 大于开始中奖
        this.cycle = this.options.cycle;
        // 进行中
        this.processing = false;
        // 上次转动时间
        this.lastTime = null;
    }

    Lottery.prototype.start = function () {
        if (this.processing) {
            return
        }

        this.processing = true;
        // 增加随机数
        this.cycle = this.options.cycle + Math.floor(Math.random() * 10);

        this.emit('Start', this, this.index, this.cycle);

        this.lastTime = Date.now();
        var that = this;
        this.innerStart(function (next) {
            if (that.animatingResult) {
                that.times++;
            }
            that.index = (that.index + 1) % that.options.pits;

            var continu = that.judge();
            if (!continu) {
                that.stop();
                return
            }

            that.printInfo();
            that.emit('Update', that, that.index, that.times);
            next();
        })
    }

    Lottery.prototype.judge = function () {
        var cycle = this.cycle;
        var times = this.times;

        // 到达旋转次数
        if (times > cycle) {
            // 没有设置奖项
            if (!Array.isArray(this.prizeIndexes)) {
                this.emit('Error', this, 404, '未设置奖项');
                return false;
            }

            if (this.prizeIndexes.indexOf(this.index) >= 0) {
                this.emit('Ended', this, this.index, this.prizeIndexes);
                return false;
            }
        }
        return true;
    }

    Lottery.prototype.emit = function (type) {
        var params = slice.call(arguments);
        var restParams = params.slice(1);
        var type = params[0];

        var method = this['on' + type];
        if (isFunction(method)) {
            method.apply(this, restParams);
        }
    }



    Lottery.prototype.stop = function () {
        this.clearJob();
        this.animatingResult = false;
        this.ticketId = null;
        this.prizeIndexes = null;
        this.times = 0;
        this.processing = false;
    }

    Lottery.prototype.getInterval = function () {
        const getIntervalFn = this.options;
        if (isFunction(getIntervalFn)) {
            return getIntervalFn(this, this.index, this.times, this.cycle);
        } else {
            return Math.floor(this.options.interval * Math.pow(this.options.rate, this.times / 10));
        }
    }

    Lottery.prototype.clearJob = function () {
        clearTimeout(this.ticketId);
    }

    Lottery.prototype.innerStart = function (cb) {
        var that = this;
        var next = function () {
            that.next(function () {
                cb && cb(next);
            })
        }
        next()
    }

    Lottery.prototype.next = function (cb) {
        var interval = this.getInterval();
        this.ticketId = setTimeout(cb, interval);
    }

    Lottery.prototype.reset = function () {
        this.stop();
        this.options = Object.assign({}, defaultOption, this.originOptions);
        this.index = 0;
    }

    Lottery.prototype.setPrize = function (prizeIndexes) {
        if (this.animatingResult) {
            return
        }
        this.prizeIndexes = prizeIndexes;
        // 设置值后, 开始模拟中奖
        this.animatingResult = true
    }


    Lottery.prototype.printInfo = function () {
        var now = Date.now();
        console.log('index:', this.index, 'times:', this.times, 'cycle:', this.cycle, 'interval:', now - this.lastTime);
        this.lastTime = now;
    }

    window.Lottery = Lottery

})()