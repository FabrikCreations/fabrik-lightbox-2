(function (fabrik, $) {

    'use strict';

    var defaults = {
        videoMaxWidth: '1920px',
    };

    var Video = function(element) {

        this.core = $(element).data('lightGallery');

        this.$el = $(element);
        this.core.s = $.extend({}, defaults, this.core.s);
        this.videoLoaded = false;

        this.init();

        return this;
    };

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

        var deferred = $.Deferred();
 
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

            video = '<div class="lg-video-limit" style="max-width:'+ self.core.s.videoMaxWidth + ';width:' + w + 'px"><div class="lg-video-wrapper" style="padding-top:' + aspectRatio + '">' + oembedHtml + '</div></div>';

            deferred.resolve(video);
        });

        return deferred.promise();

    };

    Video.prototype.destroy = function() {
        this.videoLoaded = false;
    };

    function onHasVideo(event, index, src, html) {
        /*jshint validthis:true */
        var _this = this;

        _this.loadVideo(src, 'lg-object', true, index, html).then(function(video){
            _this.core.$slide.eq(index).find('.lg-video').append(video);

            //now in the dom attach player
            var iframe = _this.core.$slide.eq(index).find('iframe')[0];

            const player = new playerjs.Player(iframe);

            $(iframe).data('player', player);
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

        var $videoSlide = _this.core.$slide.eq(prevIndex);

        var iframe = $videoSlide.find('iframe').get(0);

        var player = $(iframe).data('player');

        if(player) {
            player.pause();
        }

        var _src;
        if (_this.core.s.dynamic) {
            _src = _this.core.s.dynamicEl[index].src;
        } else {
            _src = _this.core.$items.eq(index).attr('data-src') || _this.core.$items.eq(index).attr('href'); 
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
