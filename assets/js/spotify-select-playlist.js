function loadSelectValues() {
    var urlParams = new URLSearchParams(window.location.search);
    var user = urlParams.get('id');

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("https://presave.insanedriver.com.br/spotify/playlist/" + user, requestOptions)
        .then(response => response.json())
        .catch(error => {
            console.log('Error fetching data: ', error);
            $('#preSaveError').text('An error occurred while requesting your playlists.');
            Promise.reject();
        })
        .then(data => {
            data.forEach(playlist => {
                $('#favoritePlaylist').append($('<option>', {
                    value: playlist.id,
                    text: playlist.name
                }));
            })
        })
        .catch(error => {
            console.log('Error: ', error);
            $('#preSaveError').text('An error occurred. Please try again in a few hours.');
        });
}

loadSelectValues();

$(document).ready(function () {
    $("#preSaveSendPlaylistLink").click(function () {
        var urlParams = new URLSearchParams(window.location.search);
        var user = urlParams.get('id');
        var headers = new Headers();
        headers.append("Content-Type", "application/json");

        var playlistSelected = $('#favoritePlaylist option:selected').val();
        var body = JSON.stringify({ "playlistId": playlistSelected, "uuid": user });

        var requestOptions = {
            method: 'POST',
            headers: headers,
            body: body,
            redirect: 'follow'
        };

        fetch("https://presave.insanedriver.com.br/spotify/playlist/", requestOptions)
            .then(response => {
                if (response.ok) {
                    $("#preSaveSuccessMessage").text("Done! Thank you so much!")
                }

            })
            .catch(error => console.log('error', error));

    });
});