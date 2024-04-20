var recom_songs = $('.song');
var songs = [];
var cur_song_index = -1;

let docdata = document.getElementById("pageinfo");

let progress = document.getElementById("progress");
let song = document.getElementById("audio");
let ctrlIcon = document.getElementById("ctrlIcon");

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
        let song_id = song.getAttribute('id');
        let song_name = playele.getAttribute('data-name');
        let song_artist = playele.getAttribute('data-artist');
        songs.push(song_id);
        playele.setAttribute('data-index', i);

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
        playPause();
        playAudio(song_index);
        // console.log(song.duration);
    }
    
});

$('#go-past').on('click', (e)=>{
    // playPause();
    playAudio(cur_song_index-1);
});

$('#go-forw').on('click', (e)=>{
    // playPause();
    playAudio(cur_song_index+1);
});

function playAudio(index) {
    if (index>=songs.length) {
        console.log(index);
        return;
    }
    cur_song_index = index;
    unclear();
    
    let playele = $('#'+songs[index]+' .play')[0];
    source.src = playele.getAttribute('data-audio');
    $('#song-name').text(playele.getAttribute('data-name'));
    $('#song-artist').text(playele.getAttribute('data-artist'));
    
    audio.load();
    audio.play();
    // alert(`Now playing ${playele.getAttribute('data-name')} by ${playele.getAttribute('data-artist')}`);
}


song.onloadedmetadata = function(){
    progress.max = song.duration;
    progress.value = song.currentTime;
}

function playPause(){
    if(ctrlIcon.classList.contains("fa-pause")){
        song.pause();
        ctrlIcon.classList.remove("fa-pause");
        ctrlIcon.classList.add("fa-play");
    }else{
        song.play();
        ctrlIcon.classList.add("fa-pause");
        ctrlIcon.classList.remove("fa-play");
    }
}

if(song){
    setInterval(() => {
        progress.value = song.currentTime;
        // console.log(progress.value);
    }, 500);
}

progress.onchange = function() {
    song.play();
    song.currentTime = progress.value;
    ctrlIcon.classList.add("fa-pause");
    ctrlIcon.classList.remove("fa-play");
}

function songliked() {
    let playele = $('#'+songs[cur_song_index]+' .play')[0];
    console.log(playele.getAttribute('data-name'));
    $.ajax({
        method: "POST",
        url: "/feedback",
        data: JSON.stringify({
            'track_id': playele.getAttribute('data-id'),
            'artist_id': playele.getAttribute('data-artist-id'),
            'mood': docdata.getAttribute('data-mood')
        }),
        contentType: "application/json",
        dataType: "json",
    }).done((msg) => {
        clear();
    });
}

function songdisliked() {
    let playele = $('#'+songs[cur_song_index]+' .play')[0];
    console.log(playele.getAttribute('data-name'));
    clear();
}


function clear(){ 
    document.querySelector('.sugg').classList.add('d-none');
    document.querySelector('.thanks').classList.remove('d-none');
}

function unclear(){ 
    document.querySelector('.thanks').classList.add('d-none');
    document.querySelector('.sugg').classList.remove('d-none');
}

let up = document.querySelector('.thumbs-up i');
let down = document.querySelector('.thumbs-down i');

up.addEventListener('click',function(){
    up.classList.add('scale');
    setTimeout(() => {
        up.classList.remove('scale');
    }, 1000);
    clear();
})

down.addEventListener('click',function(){
    down.classList.add('scale');
    setTimeout(() => {
        down.classList.remove('scale');
    }, 1000);
    clear();
})