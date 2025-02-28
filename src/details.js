import {redirectToAuthCodeFlow, isTokenValid, clientId} from './auth'

const savedAccessToken = localStorage.getItem("access_token");
const verifierCode = localStorage.getItem("verifier");

if (!isTokenValid() || !verifierCode) {
    redirectToAuthCodeFlow(clientId)
}

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

let album;
let data;

data = await fetchReleaseById(savedAccessToken, id);

album = render(data);
document.querySelector('#content').innerHTML = `${album}`;

function render(item) {
    return `
    <div class="album">
        <div id="album" class="albumTitle">${(item.name)} <span id="albumType" class="albumType">(${(item.album_type)})</span></div>
        <div class="albumArtists">
            <h3>Artist:</h3>  
            <ul>${renderArtists(item?.artists)}<ul>
        </div>
        <div class="albumContent">
            <div class="albumTracks">
                <h3>Tracks:</h3>
                <ul>${renderTracks(item?.tracks?.items)}<ul>
            </div>
            <img src=${item.images[0].url} width=${item.images[0].width} height=${item.images[0].height} alt=${item.name} />
        </div> 
    </div>`;
};

function renderArtists(artists) {
    return artists?.map((item) => `<li>${(item.name)}</li>`).join('');
  };

function renderTracks(tracks) {
    return tracks?.map((track) => `<li class="track">${(track.name)}: <span class="trackDuration">${formatTimeDuration(track.duration_ms)}</span></li>`).join('');
};

async function fetchReleaseById(savedAccessToken, id) {
    const result = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
        method: "GET", headers: { Authorization: `Bearer ${savedAccessToken}` }
    });

    const data = await result.json();
    return data
}

function formatTimeDuration(ms) {
    if (isNaN(ms) || ms < 0) {
        return '00:00';
    }
    let minutes = Math.floor(ms / 60000);
    let seconds = Math.floor((ms % 60000) / 1000);
    let formattedSeconds = seconds.toString().padStart(2, '0');

    return `${minutes}:${formattedSeconds}`;
}