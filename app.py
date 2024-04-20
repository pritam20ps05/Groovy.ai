import os
import gdown
import random
import spotipy
from flask_session import Session
from yt_dlp import YoutubeDL, utils
from flask import Flask, render_template, redirect, session, request

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hello'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = '/tmp/.flask_session/'
Session(app)

gdown.download(output='/tmp/yt_cookies.txt', id=os.environ['YT_ID'], quiet=False, use_cookies=False)
YDL_OPTIONS = {
    'format': 'bestaudio', 
    'noplaylist': 'True', 
    'source_address': '0.0.0.0',
    "cookiefile": "/tmp/yt_cookies.txt"
}

moods = ['happy', 'angry', 'energetic', 'sad', 'fear', 'neutral']
fvars = ['acousticness', 'danceability', 'energy', 'instrumentalness', 'key', 'liveness', 'loudness', 'mode', 'speechiness', 'tempo', 'time_signature', 'valence']
fvars_norm = [float, float, float, float, round, float, float, round, float, float, round, float]
rand_norm = [0.01, 0.01, 0.01, 0.01, 0, 0.01, 0.01, 0, 0.01, 0.01, 0, 0.01]

def uptoDecimal(num, point):
    return round(num*point)/point

@app.route('/')
def index():

    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)

    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return render_template('homepage.html', me=None)

    spotify = spotipy.Spotify(auth_manager=auth_manager)
    return render_template('homepage.html', me=spotify.me())


@app.route('/login')
def login():
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(scope='user-read-currently-playing playlist-modify-private playlist-modify-public',
                                               cache_handler=cache_handler,
                                               show_dialog=True)
    
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        auth_url = auth_manager.get_authorize_url()
        return redirect(auth_url)
    return redirect('/')


@app.route('/callback')
def callback():
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)

    if request.args.get("code"):
        auth_manager.get_access_token(request.args.get("code"))
    return redirect('/setmoodplaylist')

@app.route('/setmoodplaylist')
def setplaylists():
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return redirect('/')

    spotify = spotipy.Spotify(auth_manager=auth_manager)
    playlists = spotify.current_user_playlists()
    me = spotify.me()
    mood_playlists = []
    show_page = bool(request.args.get('show_page', False))
    for mood in moods:
        mood_foundp = None
        for item in playlists['items']:
            if item['name'] == f'mood_{mood}':
                mood_foundp = item
                break
        if not mood_foundp:
            pcreate = spotify.user_playlist_create(me['id'], f'mood_{mood}')
            mood_playlists.append({
                'mood': mood,
                'id': pcreate['id'],
                'name': pcreate['name'],
                'images': pcreate['images'],
                'url': pcreate['external_urls']['spotify']
            })
            show_page = True
        else:
            mood_playlists.append({
                'mood': mood,
                'id': mood_foundp['id'],
                'name': mood_foundp['name'],
                'images': mood_foundp['images'],
                'url': mood_foundp['external_urls']['spotify']
            })
    
    if show_page:
        return render_template('mood_playlist.html', playlists=mood_playlists)
    return redirect('/getmood')

@app.route('/getmood')
def getmood():
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return redirect('/')

    spotify = spotipy.Spotify(auth_manager=auth_manager)

    return render_template('take_photo.html')
    return f'<h2>Hi {spotify.me()["display_name"]}, ' \
           f'<small><a href="/sign_out">[sign out]<a/></small></h2>' \
           f'<a href="/player?mood=happy">Mood Happy</a> | ' \
           f'<a href="/player?mood=sad">Mood Sad</a> | ' \
           f'<a href="/player?mood=angry">Mood Angry</a> | ' \
           f'<a href="/player?mood=energetic">Mood Energetic</a> | ' \
           f'<a href="/player?mood=fear">Mood Fear</a> | ' \
           f'<a href="/player?mood=neutral">Mood Neutral</a> | ' 

@app.route('/player')
def player():
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return redirect('/')

    spotify = spotipy.Spotify(auth_manager=auth_manager)
    playlists = spotify.current_user_playlists()
    mood = request.args.get('mood')
    if not mood:
        return redirect('/setmoodplaylist?show_page=True')
    mood_playlist = None
    mood_found = False
    for item in playlists['items']:
        if item['name'] == f'mood_{mood}' and item['tracks']['total']>3 and item['tracks']['total']<=100:
            mood_found = True
            mood_playlist = item
            break
    if not mood_found:
        return redirect('/setmoodplaylist?show_page=True')
    mp_items = spotify.playlist_items(mood_playlist['id'])
    track_ids = [track_info['track']['id'] for track_info in mp_items['items']]
    features_tracks = spotify.audio_features(tracks=track_ids)
    max_f = []
    min_f = []
    target_f = []
    kw = {}
    for i, fv in enumerate(fvars):
        max_fval = -100000
        min_fval = 100000
        target_fval = 0
        c = 0
        for features in features_tracks:
            fval = features[fv]
            if fval > max_fval:
                max_fval = fval
            if fval < min_fval:
                min_fval = fval
            target_fval += fval
            c += 1
        target_fval = fvars_norm[i](target_fval / c)
        max_f.append(max_fval)
        min_f.append(min_fval)
        target_f.append(target_fval)
        kw[f'max_{fv}'] = max_fval
        kw[f'min_{fv}'] = min_fval
        # kw[f'target_{fv}'] = target_fval
    if not f'{mood}_target' in session:
        session[f'{mood}_target'] = target_f

    kw1 = {}
    for i, tval in enumerate(session[f'{mood}_target']):
        var = fvars[i]
        kw1[f'target_{var}'] = tval

    if not f'{mood}_liked_artist_id' in session:
        reco = spotify.recommendations(limit=10, seed_tracks=track_ids[:5], **kw1)
    else:
        reco = spotify.recommendations(limit=10, seed_artists=[session[f'{mood}_liked_artist_id']], **kw1)

    real_songs = []
    for track in reco['tracks']:
        name = track['name']
        sname = track['name']
        if len(sname) > 16:
            sname = sname[:16] + '...'
        real_songs.append({
            'id': track['id'],
            'name': sname,
            'full_name': name,
            'url': track['external_urls']['spotify'],
            'artists': [artist['name'] for artist in track['artists']],
            'artists_id': [artist['id'] for artist in track['artists']],
            'image': track['album']['images'][1]['url']
        })
    
    random.shuffle(track_ids)
    reco = spotify.recommendations(limit=20, seed_tracks=track_ids[:5], **kw)
    reco_songs = []
    for track in reco['tracks']:
        name = track['name']
        sname = track['name']
        if len(sname) > 16:
            sname = sname[:16] + '...'
        reco_songs.append({
            'id': track['id'],
            'name': sname,
            'full_name': name,
            'url': track['external_urls']['spotify'],
            'artists': [artist['name'] for artist in track['artists']],
            'artists_id': [artist['id'] for artist in track['artists']],
            'image': track['album']['images'][1]['url']
        })

    playlist_songs = []
    # return mp_items
    for track in mp_items['items']:
        track = track['track']
        name = track['name']
        sname = track['name']
        if len(sname) > 16:
            sname = sname[:16] + '...'
        playlist_songs.append({
            'id': track['id'],
            'name': sname,
            'full_name': name,
            'url': track['external_urls']['spotify'],
            'artists': [artist['name'] for artist in track['artists']],
            'artists_id': [artist['id'] for artist in track['artists']],
            'image': track['album']['images'][1]['url']
        })
    random.shuffle(playlist_songs)
    param = {
        'mood': mood,
        'playlist_id': mood_playlist['id']
    }
    return render_template('player.html', reco_songs=reco_songs, playlist_songs=playlist_songs[:5], real_songs=real_songs[:10], param=param, me=spotify.me())


@app.route('/feedback',  methods=['POST'])
def feedback():
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return redirect('/')

    spotify = spotipy.Spotify(auth_manager=auth_manager)
    req = request.json
    features = spotify.audio_features(tracks=[req['track_id']])[0]
    mood = req['mood']

    target_f = []
    for i, fv in enumerate(fvars):
        fval = features[fv]
        target_fval = fvars_norm[i](fval*0.7 + session[f'{mood}_target'][i]*0.3)
        target_f.append(target_fval)

    session[f'{mood}_target'] = target_f
    session[f'{mood}_liked_artist_id'] = req['artist_id']
    return ''


@app.route('/sign_out')
def sign_out():
    # for key in session:
    #     session.pop(key, None)
    session.clear()
    return redirect('/')


@app.route('/getrack', methods=['POST'])
def getrack():
    req = request.json
    name = req['name']
    artist = req['artist']
    query = f'{artist} - {name} official audio'.replace(":", "").replace("\"", "")
    try:
        with YoutubeDL(YDL_OPTIONS) as ydl:
            info = ydl.extract_info(f'ytsearch:{query}', download=False)
    except utils.ExtractorError as e:
        with YoutubeDL(YDL_OPTIONS) as ydl:
            info = ydl.extract_info(f'ytsearch:{query}', download=False)

    info = info['entries'][0]
    
    return {
        'link': info['url']
    }


@app.route('/currently_playing')
def currently_playing():
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return redirect('/')
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    track = spotify.current_user_playing_track()
    if not track is None:
        return track
    return "No track currently playing."


@app.route('/current_user')
def current_user():
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return redirect('/')
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    return spotify.current_user()


'''
Following lines allow application to be run more conveniently with
`python app.py` (Make sure you're using python3)
(Also includes directive to leverage pythons threading capacity.)
'''
if __name__ == '__main__':
    app.run(debug=True, threaded=True, port=int(os.environ.get("PORT", 5000)))