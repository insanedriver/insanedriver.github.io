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

    playerTeaserImagined = new YT.Player('playerTeaserImagined', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: 'DiP6K4qYvaY',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerSiliconLyric = new YT.Player('playerSiliconLyric', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: '_2zR4uHhIBk',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerImaginedLyric = new YT.Player('playerImaginedLyric', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: 'QhPJuVkPNNY',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerTeaserExtendedDesperate = new YT.Player('playerTeaserExtendedDesperate', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: '3Gh1jd4u7NE',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerTeaserInsaneDriver = new YT.Player('playerTeaserInsaneDriver', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: 'kCwIOad0ur8',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerDeperateLyric = new YT.Player('playerDeperateLyric', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: 'vJl7VaET5QU',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerDistantLyric = new YT.Player('playerDistantLyric', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: 'dvFAJez2xEw',
        events: {
            'onReady': onPlayerReady
        }
    });

    playerGhostsLyric = new YT.Player('playerGhostsLyric', {
        height: playerSizeResolver().height,
        width: playerSizeResolver().width,
        videoId: '0Hx9LmWjxQo',
        events: {
            'onReady': onPlayerReady
        }
    });

}

function onPlayerReady(event) {
    event.target.setPlaybackQuality('hd720');
}