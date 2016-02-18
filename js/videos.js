$(window).load(function() {
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;

    var screenWidth = $(window).width(),
        screenHeight = $(window).height(),
        largeDeviceWidth = 1200,
        mediumDeviceWidth = 992,
        smallDeviceWidth = 768;


    var playerSizeResolver = function() {
        if(screenWidth > largeDeviceWidth) {
            return {
                width: 1100,
                height: 619
            }
        }
        else if(screenWidth > mediumDeviceWidth) {
            return {
                width: 900,
                height: 506
            }
        }
        else if(screenWidth > smallDeviceWidth) {
            return {
                width: 700,
                height: 394
            }
        }
        else {
            return {
                width: screenWidth - 50,
                height: (screenWidth - 50) * 0.562
            }
        }
    };


    function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
            height: playerSizeResolver().height,
            width: playerSizeResolver().width,
            videoId: 'iR7k_6wKnxE',
            events: {
                'onReady': onPlayerReady
            }
        });
    }

    function onPlayerReady(event) {
        event.target.setPlaybackQuality('hd720');
    }
});