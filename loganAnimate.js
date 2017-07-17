(function (HTMLElement, $) {
    // js OOP编程 类
    var Class = function (parent) {
        var _class = function () {
            this.init.apply(this, arguments);
        };

        // 类的继承
        if (parent) {
            var subclass = function () { };
            subclass.prototype = parent.prototype;

            _class.prototype = new subclass;
        };

        // 实例对象的别名
        _class.fn = _class.prototype;

        // 类的别名
        _class.fn.parent = _class;

        _class.fn.init = function () { };

        // 类方法的扩展方法
        _class.extend = function (obj) {
            var extended = obj.extended;

            for (var i in obj) {
                _class[i] = obj[i];
            };

            if (extended) {
                extended();
            }
        };

        _class.include = function (obj) {
            var included = obj.included;

            for (var i in obj) {
                _class.fn[i] = obj[i];
            };

            if (included) {
                included();
            }
        };

        return _class;
    };

    // 工具方法
    function uuid() {

        var date = new Date().getTime();

        var factors = ((date * date) >> 8) & 0xffff;
        factors = (factors * factors).toString(16);
        factors = factors + factors + factors + factors;

        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (character) {

            var random = ((parseInt(factors[factors.length - 1], 16) + Math.random() * 16) % 0xF) | 0;

            --factors.length;

            return ((character === "x") ? random : (random & 0x3 | 0x8)).toString(16);

        });

        return uuid;
    }

    // 是object 同时为空
    function isEmptyObject(obj) {
        if (typeof obj !== "object") {
            return true;
        };

        for (var name in obj) {
            return false;
        };

        return true;
    }

    function deepCopy(obj) {
        if (typeof obj === "string" || typeof obj === "number") {
            return obj;
        }

        var newObj = new obj.__proto__.constructor;

        for (var i in obj) {
            newObj[i] = obj[i];
        }

        return newObj;
    }

    function unitIsPx(key) {
        if (key == "width" ||
            key == "height" ||
            key == "top" ||
            key == "left" ||
            key == "right" ||
            key == "bottom" ||
            key == "font-size" ||
            key == "fontSize" ||
            key.indexOf("margin") !== -1 ||
            key.indexOf("padding") !== -1 ||
            key.indexOf("border") !== -1) {

            return true;
        } else {
            return false;
        }
    }

    function extend() {
        var args = Array.prototype.slice.call(arguments);
        var target = args[0] || {};

        for (var i = 1, len = args.length; i < len; i++) {

            if ((options = args[i]) != null) {
                for (name in options) {
                    target[name] = options[name];
                }
            }
        }

        return target;
    };

    function getStyleFromAttr(element) {
        var styleParams = $(element).attr('style') ? $(element).attr('style').split(';') : [];
        var style = {};
        styleParams.forEach(function (item) {
            var styleItem = item.split(':');
            style[styleItem[0].trim()] = styleItem[1];
        });

        return style;
    }

    var getOriginStyleValue = function() {
        
    }

    HTMLElement.prototype.loganAnimate = function (prop, params, callback) {
        var element = this,
            callback = callback,
            empty = isEmptyObject(prop),
            defaultParams = {
                duration: 300,
                delay: 0,
                easing: "ease-out"
            };

        if (typeof params === "function") {
            callback = params;
            params = {};
        };

        if (typeof params === "number") {
            defaultParams.duration = params;
            params = {};
        };

        var p = extend(defaultParams, params);

        if (empty) {
            callback && callback();
        } else {

            // var transform = $(element)[0].css("transform");
            var transform = getStyleFromAttr(element)["transform"];

            if (!transform) {
                transform = "translate3d(0, 0, 0) rotate(0deg) scale(1)"
            }

            // 初始化
            element.css({
                "height": element.css('height'),
                "width": element.css('width'),
                "opacity": element.css('opacity'),
                "transform": transform
            });

            setTimeout(function () {
                element.css({
                    "transition": "all " + p.duration + 'ms ' + p.easing + " " + p.delay + 'ms'
                })
            })
            // debugger;
            // 开启GPU加速的HACK
            // element.css({
            //     "webkit-transform": "translate3d(0,0,0)",
            //     "-moz-transform": "translate3d(0,0,0)",
            //     "-ms-transform": "translate3d(0,0,0)",
            //     "-o-transform": "translate3d(0,0,0)",
            //     "transform": "translate3d(0,0,0)"
            // });

            setTimeout(function () {
                element.css(prop);
            }, 0);


            setTimeout(function () {
                element.css({
                    "transition": "none"
                });
                callback && callback();
            }, p.duration + p.delay);
        };

        return element;
    }

    HTMLElement.prototype.css = function () {
        var args = Array.prototype.slice.call(arguments),
            element = this,
            prop = args[0];

        if (args.length === 0) {
            return;
        };

        if (typeof prop === "string") {

            if (args.length === 1) {
                if (getStyleFromAttr(element)[prop]) {
                    return getStyleFromAttr(element)[prop];
                } else {
                    return getComputedStyle(element)[prop];
                }
            } else if (args.length === 2) {
                var key = args[0];
                if (unitIsPx(key) && parseFloat(args[1]) == args[1]) {
                    var value = args[1] + "px";
                } else {
                    var value = args[1];
                }
                element.style[args[0]] = value;

                return element;
            };
        };

        if (typeof prop === "object" && !(prop instanceof Array)) {

            Object.keys(prop).forEach(function (key) {
                if (unitIsPx(key) && parseFloat(prop[key]) == prop[key]) {
                    var value = prop[key] + "px";
                } else {
                    var value = prop[key];
                }

                element.style[key] = value;
            });

            return element;
        } else {
            console.error("arg1类型错误");
        }
    }

    var reqAnimate = function () { }

    if (jQuery) {
        jQuery.fn.extend({
            loganAnimate: HTMLElement.prototype.loganAnimate,
            reqAnimate: reqAnimate
        });
    }

    if ($.async) {
        jQuery.extend({
            animateQueue: function () {
                // [{el: "", prop: {}, params: {}]
                var args = Array.prototype.slice.call(arguments);
                var el = "";
                var params = {
                    duration: 300,
                    delay: 0,
                    easing: "ease-out"
                };
                return $.async.all(args, function (arg) {
                    var step = this;

                    if (arg.el) {
                        el = arg.el;
                    }

                    console.log($(el))

                    params = extend(params, arg.params);

                    $(el).loganAnimate(arg.animate, params, function () {
                        step.next();
                    });
                });

            }
        })
    }

})(HTMLElement, window.jQuery);