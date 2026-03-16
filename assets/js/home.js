$(window).load(function () {
    $("#player_spotify .player_container").append('<iframe src="https://open.spotify.com/embed?uri=spotify:playlist:4NSGSicKX7WP3qrBLCUdkA" style="min-height: 400px;" width="100%" height="100%" frameborder="0" allowtransparency="true" allow="encrypted-media" class="iframe-spotify"></iframe>');
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