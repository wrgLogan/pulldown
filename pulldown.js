(function ($) {
    if (!$) {
        console.error('pulldown required jQuery');
        return;
    }

    if (!Modernizr) {
        var Modernizr = {
            touch: true
        }
    }

    $.fn.extend({
        /* $.fn.pullDownLoad(_caBacks)
        @param _caBacks (object) 3个delegate
        $().pullDownLoad({
            overBoundary: function() {..下拉超过可加载边界},
            innerBoundary: function() {..上拉回到边界内}
            update: function(over) {
                //..如果超过边界会触发这个delegate 里面有over方法 over(callback) 
                ...请求数据..
                //数据请求完 执行over会完成复原动画然后执行里面的回调
                over(function() {
                    根据数据刷新页面（一大原则是： 数据的刷新不要和过度动画同时进行）
                })
            }
        })
    */
        pullDownLoad: function (_caBacks) {
            var content = this;
            var startClientY = 0;
            var count = 0;
            var _boundary = 150;
            var isOverBoundary = false;

            console.log(Modernizr.touch);

            content.bind(Modernizr.touch ? 'touchmove' : 'mouseover', function (e) {
                console.log(e);
                if (e.originalEvent && e.originalEvent.touches) {
                    var touche = e.originalEvent.touches[0];
                } else {
                    var touche = e;
                }
                var scrollTop = content.scrollTop();

                if (scrollTop <= 0) {
                    count++;
                }

                // 触发下拉
                if (scrollTop <= 0 && count >= 3) {
                    if (!startClientY) {
                        startClientY = touche.clientY;
                        content.css({
                            "overflow": "hidden",
                            "transition": "all 30ms linear"
                        });
                        // console.log(startClientY);
                    } else {

                        var offsetY = touche.clientY - startClientY;
                        console.log(offsetY);
                        if (offsetY < 0) {
                            content.css({
                                "overflow": "auto"
                            });
                        }

                        if (touche.clientY - startClientY < 0) {
                            offsetY = 0;
                        };

                        if (offsetY >= _boundary && !isOverBoundary) {
                            isOverBoundary = true;
                            _caBacks.overBoundary && _caBacks.overBoundary();
                        };

                        if (offsetY < _boundary && isOverBoundary) {
                            isOverBoundary = false;
                            _caBacks.innerBoundary && _caBacks.innerBoundary();
                        };

                        content.css({
                            "transform": "translate3d(0, " + offsetY / 3 + "px, 0)"
                        });
                    };

                };

            });

            content.bind(Modernizr.touch ? 'touchend' : 'mouseup', function (e) {

                if (startClientY) {
                    if (isOverBoundary) {
                        content.loganAnimate({
                            "transform": "translate3d(0," + _boundary / 3 + "px, 0px)"
                        }, {
                                speed: 180,
                                easing: 'linear'
                            }, function () {

                                if (isOverBoundary) {

                                    _caBacks.update(over);
                                };

                            })
                    } else {
                        over();
                    }

                }

            })

            function over(callback) {
                content.loganAnimate({
                    "transform": "translate3d(0, 0, 0)"
                }, {
                        speed: 180,
                        easing: 'linear'
                    }, function () {
                        startClientY = 0;
                        count = 0;
                        content.css({
                            "overflow": "auto"
                        });

                        isOverBoundary = false;

                        if (callback) {
                            callback();
                        }

                    });

            }
        }
    })
})(window.jQuery);