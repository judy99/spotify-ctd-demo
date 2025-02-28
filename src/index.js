import {redirectToAuthCodeFlow, getAccessToken, isTokenValid, clientId} from './auth'
let authCode, params, albums, data;

console.log(`clientId = `, clientId)

const savedAccessToken = localStorage.getItem("access_token");
const verifierCode = localStorage.getItem("verifier");

console.log(`savedAccessToken = `, savedAccessToken)

if (!isTokenValid() || !verifierCode) {
    redirectToAuthCodeFlow(clientId)
}
   
// creates a new URLSearchParams object 
// that provides methods to parse, access, and manipulate query parameters
const queryString = window.location.search;
params = new URLSearchParams(queryString);

// get code from query parameter to get the access token
authCode = params.get("code")

// get the access token
if (!savedAccessToken || savedAccessToken === "undefined") {
    getAccessToken(clientId, authCode)
}

data = await fetchNewReleases(savedAccessToken);


albums = render(data);
document.querySelector('#content').innerHTML = `<div class="subtitle">Click on a card for details</div><div class="grid">${albums}</div>`;

async function fetchNewReleases(accessToken) {
    const result = await fetch("https://api.spotify.com/v1/browse/new-releases", {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}`}, credentials: 'omit' 
    });

    const data = await result.json();
    return data.albums; // Assuming the data is nested under "albums"

}

function render(albums) {
    return albums?.items?.map((item) => `
    <div class="card">
    <a href="details.html?id=${item.id}">
        <img src=${item.images[0].url} width=${item.images[0].width} height=${item.images[0].height} alt=${item.name} />
        <p class="title"> ${(item.name)}</p>
        <p class="artist"> ${item.artists.length > 1 ? "artists: " : "artist: "} ${(item.artists.map(artist => `<span>&nbsp;<strong>${artist.name}</strong></span>`))}</p>
    </a>
    </div>`)
    .join('');
  };
