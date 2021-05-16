$(window).load(function () {
    $("#player_spotify .follow_title").append('<h4><iframe src="https://embed.spotify.com/follow/1/?uri=spotify:artist:2ye4AQnKI7zNyOnuLGHaaE&amp;size=basic&amp;theme=dark" width="150" height="25" scrolling="no" frameborder="0" style="border:none; overflow:hidden;" allowtransparency="true"></iframe></h4>');
    $("#player_spotify .player_container").append('<iframe src="https://open.spotify.com/embed?uri=spotify:playlist:4NSGSicKX7WP3qrBLCUdkA" height="328" width="480" frameborder="0" allowtransparency="true" allow="encrypted-media" class="iframe-spotify" </iframe>');
    window.loadingScreen.finish();
});
$(document).ready(function () {
    $("#owl-demo").owlCarousel({
        slideSpeed: 1000,
        paginationSpeed: 1000,
        singleItem: true,
        pagination: false,
        dots: false,
        autoPlay: 5000
    });
});