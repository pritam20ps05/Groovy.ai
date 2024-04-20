var recom_songs = $('.song');
var songs = [];
var cur_song_index = -1;

let audio = document.getElementById('audio');
let source = document.getElementById('audioSource');

audio.addEventListener("ended", (e)=>{
    playAudio(cur_song_index+1);
});

$( document ).ready(()=>{
    for (let i = 0; i < recom_songs.length; i++) {
        const song = recom_songs[i];
        let playele = $('#'+song.id+' .play')[0];
        let imgele = $('#'+song.id+' .song-img')[0];
        let loadele = $('#'+song.id+' .loading-anim')[0];
    
        // let loaded = playele.getAttribute('data-loaded');
        let song_id = playele.getAttribute('data-id');
        let song_name = playele.getAttribute('data-name');
        let song_artist = playele.getAttribute('data-artist');
        songs.push(song_id);

        $.ajax({
            method: "POST",
            url: "/getrack",
            data: JSON.stringify({
                'name': song_name,
                'artist': song_artist
            }),
            contentType: "application/json",
            dataType: "json",
        }).done((msg) => {
            let audio_url = msg['link']
            playele.setAttribute('data-loaded', 'true');
            playele.setAttribute('data-audio', audio_url);
            loadele.classList.add('d-none');
            imgele.classList.remove('d-none');
        });
    }
});


$('.play').on('click', (e)=>{
    let elm = e.target;
    let isloaded = elm.getAttribute('data-loaded');
    let song_index = parseInt(elm.getAttribute('data-index'));
    
    if (isloaded==='true') {
        playAudio(song_index);
    }
});

function playAudio(index) {
    if (index>=songs.length) {
        console.log(index);
        return;
    }
    cur_song_index = index;
    
    let playele = $('#'+songs[index]+' .play')[0];
    source.src = playele.getAttribute('data-audio');
    $('#song-name').text(playele.getAttribute('data-name'));
    $('#song-artist').text(playele.getAttribute('data-artist'));
    
    audio.load();
    audio.play();
    // alert(`Now playing ${playele.getAttribute('data-name')} by ${playele.getAttribute('data-artist')}`);
}