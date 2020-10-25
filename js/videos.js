var player, playerChange, playerBuried, playerTide;

$(window).load(function() {
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

});

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
    playerToday = new YT.Player('playerToday', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: '9vjR56iVLq8',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerBuried = new YT.Player('playerBuried', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: 'gV4XZMaa9wQ',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerTide = new YT.Player('playerTide', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: 'vif1ku9btbM',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerChange = new YT.Player('playerChange', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: 'iR7k_6wKnxE',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerTeaserSilicon = new YT.Player('playerTeaserSilicon', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: 'S3O9aD76HRY',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerTeaserSiliconExtended = new YT.Player('playerTeaserSiliconExtended', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: 'WGEYIYcISoE',
        events: {
            'onReady': onPlayerReady
        }
    });

}

function onPlayerReady(event) {
    event.target.setPlaybackQuality('hd720');
}