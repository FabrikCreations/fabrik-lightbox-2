/*! lg-video - v1.3.0 - 2020-05-03
* http://sachinchoolur.github.io/lightGallery
* Copyright (c) 2020 Sachin N; Licensed GPLv3 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define(['jquery'], function (a0) {
            return (factory(a0));
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else {
        factory(root["jQuery"]);
    }
}(this, function ($) {

    (function (fabrik) {

        'use strict';

        var defaults = {
            videoMaxWidth: '855px',
            autoplayFirstVideo: true,
            videojs: false,
            videojsOptions: {}
        };

        var Video = function (element) {

            this.core = $(element).data('lightGallery');

            this.$el = $(element);
            this.core.s = $.extend({}, defaults, this.core.s);
            this.videoLoaded = false;

            this.init();

            return this;
        };

        Video.prototype.init = function () {
            var _this = this;

            // Event triggered when video url found without poster
            _this.core.$el.on('hasVideo.lg.tm', onHasVideo.bind(this));

            // Set max width for video
            _this.core.$el.on('onAferAppendSlide.lg.tm', onAferAppendSlide.bind(this));

            if (_this.core.doCss() && (_this.core.$items.length > 1) && (_this.core.s.enableSwipe || _this.core.s.enableDrag)) {
                _this.core.$el.on('onSlideClick.lg.tm', function () {
                    var $el = _this.core.$slide.eq(_this.core.index);
                    _this.loadVideoOnclick($el);
                });
            } else {

                // For IE 9 and bellow
                _this.core.$slide.on('click.lg', function () {
                    _this.loadVideoOnclick($(this));
                });
            }

            _this.core.$el.on('onBeforeSlide.lg.tm', onBeforeSlide.bind(this));

            _this.core.$el.on('onAfterSlide.lg.tm', function (event, prevIndex) {
                _this.core.$slide.eq(prevIndex).removeClass('lg-video-playing');
            });

            if (_this.core.s.autoplayFirstVideo) {
                _this.core.$el.on('onAferAppendSlide.lg.tm', function (e, index) {
                    if (!_this.core.lGalleryOn) {
                        var $el = _this.core.$slide.eq(index);
                        setTimeout(function () {
                            _this.loadVideoOnclick($el);
                        }, 100);
                    }
                });
            }
        };

        Video.prototype.loadVideo = function (src, addClass, noPoster, index, html) {
            var _this = this;
            var video = '';
            var autoplay = 1;
            //var a = '';
            var isVideo = this.core.isVideo(src, index) || false;
            var videoTitle;

            var deferred = $.Deferred();

            if (_this.core.s.dynamic) {
                videoTitle = _this.core.s.dynamicEl[_this.core.index].title;
            } else {
                videoTitle = _this.core.$items.eq(_this.core.index).attr('title') || _this.core.$items.eq(_this.core.index).find('img').first().attr('alt');
            }

            videoTitle = videoTitle ? 'title="' + videoTitle + '"' : '';

            // Enable autoplay based on setting for first video if poster doesn't exist
            if (noPoster) {
                if (this.videoLoaded) {
                    autoplay = 0;
                } else {
                    autoplay = this.core.s.autoplayFirstVideo ? 1 : 0;
                }
            }

            if (isVideo.html5) {
                var fL = html.substring(0, 1);
                if (fL === '.' || fL === '#') {
                    html = $(html).html();
                }

                video = html;

                deferred.resolve(video);

            } 
            else if (isVideo) {

                fabrik.embedService.getEmbed(src).then(function(data) {

                    var ratio =  (data.height/data.width).toPrecision(4),
                    aspectRatio = (ratio * 100).toPrecision(4) + '%',
        
                    widthLimit = document.documentElement.clientWidth;
        
                    if(widthLimit > 400) {
                        widthLimit = widthLimit - 160;
                    }
        
                    var heightLimit = document.documentElement.clientHeight - ($('.lg-toolbar').height()*2) - 64,
                    
                    w = data.width,
                    h = data.height,
                    
                    newHeight = widthLimit * ratio;
        
                    if (newHeight > heightLimit) {
                        // the new height would overlap the container height so scale the width instead
                        w = (heightLimit / ratio).toPrecision(4);
        
                    } else {
        
                        h = widthLimit * ratio;
                        w = (h / ratio).toPrecision(4);
                    }
        
                    var oembedHtml = data.response ? data.response.html : data.html;
        
                    video = '<div class="lg-video-limit" style="max-width:'+ _this.core.s.videoMaxWidth + ';width:' + w + 'px"><div class="lg-video-wrapper" style="padding-top:' + aspectRatio + '">' + oembedHtml + '</div></div>';
        
                    deferred.resolve(video);
                });

            }  

            return deferred.promise();
        };

        Video.prototype.loadVideoOnclick = function ($el) {

            var _this = this;
            // check slide has poster
            if ($el.find('.lg-object').hasClass('lg-has-poster') && $el.find('.lg-object').is(':visible')) {

                // check already video element present
                if (!$el.hasClass('lg-has-video')) {

                    $el.addClass('lg-video-playing lg-has-video');

                    var _src;
                    var _html;
                    var _loadVideo = function (_src, _html) {

                        $el.find('.lg-video').append(_this.loadVideo(_src, '', false, _this.core.index, _html));

                        if (_html) {
                            if (_this.core.s.videojs) {
                                try {
                                    videojs(_this.core.$slide.eq(_this.core.index).find('.lg-html5').get(0), _this.core.s.videojsOptions, function () {
                                        this.play();
                                    });
                                } catch (e) {
                                    console.error('Make sure you have included videojs');
                                }
                            } else {
                                _this.core.$slide.eq(_this.core.index).find('.lg-html5').get(0).play();
                            }
                        }

                    };

                    if (_this.core.s.dynamic) {

                        _src = _this.core.s.dynamicEl[_this.core.index].src;
                        _html = _this.core.s.dynamicEl[_this.core.index].html;

                        _loadVideo(_src, _html);

                    } else {

                        _src = _this.core.$items.eq(_this.core.index).attr('data-src') || _this.core.$items.eq(_this.core.index).attr('href');
                        _html = _this.core.$items.eq(_this.core.index).attr('data-html');

                        _loadVideo(_src, _html);

                    }

                    var $tempImg = $el.find('.lg-object');
                    $el.find('.lg-video').append($tempImg);

                    // @todo loading icon for html5 videos also
                    // for showing the loading indicator while loading video
                    if (!$el.find('.lg-video-object').hasClass('lg-html5')) {
                        $el.removeClass('lg-complete');
                        $el.find('.lg-video-object').on('load.lg error.lg', function () {
                            $el.addClass('lg-complete');
                        });
                    }

                } else {

         
                    var videoWrapper = $el.find('.lg-video').get(0);  
                    var html5Player = $el.find('.lg-html5').get(0);

                    if (videoWrapper) {
                        try {
                            
                            var iframe = $(videoWrapper).find('iframe').get(0);

                            var player = $(iframe).data('player');

                            if(player) {
                                player.pause();
                            }

                        } catch (e) {
                            console.error('Make sure you have included froogaloop2 js');
                        }
                    } 
                    else if (html5Player) {
                        if (_this.core.s.videojs) {
                            try {
                                videojs(html5Player).play();
                            } catch (e) {
                                console.error('Make sure you have included videojs');
                            }
                        } else {
                            html5Player.play();
                        }
                    }

                    $el.addClass('lg-video-playing');

                }
            }
        };

        Video.prototype.destroy = function () {
            this.videoLoaded = false;
        };

        function onHasVideo(event, index, src, html) {
            /*jshint validthis:true */
            var _this = this;

            //_this.core.$slide.eq(index).find('.lg-video').append(
                
            _this.loadVideo(src, 'lg-object', true, index, html).then(function (video) {
                _this.core.$slide.eq(index).find('.lg-video').append(video);

                //now in the dom attach player
                var iframe = _this.core.$slide.eq(index).find('iframe')[0];

                if (iframe) {

                    var player = new playerjs.Player(iframe);

                    $(iframe).data('player', player);
                }
                else if (html) {
                    if (_this.core.s.videojs) {
                        try {
                            videojs(_this.core.$slide.eq(index).find('.lg-html5').get(0), _this.core.s.videojsOptions, function () {
                                if (!_this.videoLoaded && _this.core.s.autoplayFirstVideo) {
                                    this.play();
                                }
                            });
                        } catch (e) {
                            console.error('Make sure you have included videojs');
                        }
                    } else {
                        if (!_this.videoLoaded && _this.core.s.autoplayFirstVideo) {
                            _this.core.$slide.eq(index).find('.lg-html5').get(0).play();
                        }
                    }
                }
            });
  
        }

        function onAferAppendSlide(event, index) {
            /*jshint validthis:true */
            var $videoCont = this.core.$slide.eq(index).find('.lg-video-cont');

            if (!$videoCont.hasClass('lg-has-iframe')) {
                $videoCont.css('max-width', this.core.s.videoMaxWidth);
                this.videoLoaded = true;
            }
        }

        function onBeforeSlide(event, prevIndex, index) {
            /*jshint validthis:true */
            var _this = this;

            var $videoSlide = _this.core.$slide.eq(prevIndex);

            var fabrikPlayer = $videoSlide.find('iframe').get(0);
            var html5Player = $videoSlide.find('.lg-html5').get(0);

            if (fabrikPlayer) {
                try {
                    var player = $(fabrikPlayer).data('player');

                    if (player) {
                        player.pause();
                    }

                } catch (e) {
                    console.error('Cant find Fabrik player');
                }
            } else if (html5Player) {
                if (_this.core.s.videojs) {
                    try {
                        videojs(html5Player).pause();
                    } catch (e) {
                        console.error('Make sure you have included videojs');
                    }
                } else {
                    html5Player.pause();
                }
            }

            var _src;
            if (_this.core.s.dynamic) {
                _src = _this.core.s.dynamicEl[index].src;
            } else {
                _src = _this.core.$items.eq(index).attr('data-src') || _this.core.$items.eq(index).attr('href');
            }

            var _isVideo = this.core.isVideo(_src, index) || {};

            if (_isVideo) {
                _this.core.$outer.addClass('lg-hide-zoom');
            }
            else {
                _this.core.$outer.removeClass('lg-hide-zoom');
            }

        }

        $.fn.lightGallery.modules.video = Video;

    })(window.fabrik);

}));