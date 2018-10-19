(function (fabrik, $) {

    'use strict';

    var defaults = {};

    var Video = function(element) {

        this.core = $(element).data('lightGallery');

        this.$el = $(element);
        this.core.s = $.extend({}, defaults, this.core.s);
        this.videoLoaded = false;

        this.init();

        return this;
    }

    Video.prototype.init = function() {
        var _this = this;

        // Event triggered when video url found without poster
        _this.core.$el.on('hasVideo.lg.tm', onHasVideo.bind(this));

        // Set max width for video
        _this.core.$el.on('onAferAppendSlide.lg.tm', onAferAppendSlide.bind(this));


        _this.core.$el.on('onBeforeSlide.lg.tm', onBeforeSlide.bind(this));

        _this.core.$el.on('onAfterSlide.lg.tm', function(event, prevIndex) {
            _this.core.$slide.eq(prevIndex).removeClass('lg-video-playing');
        });
    };

    Video.prototype.loadVideo = function(src, addClass, noPoster, index, html) {
        var video = '';

        var self = this;

        return new Promise(resolve => {
            fabrik.embedService.getEmbed(src).then(function(data) {

                var ratio =  (data.height/data.width).toPrecision(4),
                aspectRatio = ratio * 100 + '%',

                widthLimit = document.documentElement.clientWidth - 160,
                heightLimit = document.documentElement.clientHeight - $('.lg-sub-html').height() - $('.lg-toolbar').height() - 64,
                
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

                video = '<div class="wrapper" style="max-width:' + data.width + 'px;width:' + w + 'px"><div class="video-wrapper" style="padding-top:' + aspectRatio + '">' + oembedHtml + '</div></div>';

                resolve(video);
            });
        });  
    };

    Video.prototype.destroy = function() {
        this.videoLoaded = false;
    };

    function onHasVideo(event, index, src, html) {
        /*jshint validthis:true */
        var _this = this;

        _this.loadVideo(src, 'lg-object', true, index, html).then(function(video){
            _this.core.$slide.eq(index).find('.lg-video').append(video);

        });
    }

    function onAferAppendSlide(event, index) {
        /*jshint validthis:true */
        var $videoCont = this.core.$slide.eq(index).find('.lg-video-cont');

        if (!$videoCont.hasClass('lg-has-iframe')) {
            this.videoLoaded = true;
        }
    }

    function onBeforeSlide(event, prevIndex, index) {
        /*jshint validthis:true */
        var _this = this;

        //var $videoSlide = _this.core.$slide.eq(prevIndex);

        var _src;
        if (_this.core.s.dynamic) {
            _src = _this.core.s.dynamicEl[index].src;
        } else {
            _src = _this.core.$items.eq(index).attr('href') || _this.core.$items.eq(index).attr('data-src');
        }

        var _isVideo = this.core.isVideo(_src, index) || false;

        if (_isVideo) {
            _this.core.$outer.addClass('lg-hide-zoom');
        }
        else {
            _this.core.$outer.removeClass('lg-hide-zoom');
        }
    }

    $.fn.lightGallery.modules.video = Video;

})(window.fabrik, jQuery);
