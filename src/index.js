import {redirectToAuthCodeFlow, getAccessToken, isTokenValid, clientId} from './auth'
let authCode, params, albums, data;

const savedAccessToken = localStorage.getItem("access_token");
const verifierCode = localStorage.getItem("verifier");

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

if (!data.error) {
    albums = render(data);
    document.querySelector('#content').innerHTML = `<div class="subtitle">Click on a card for details</div><div class="grid">${albums}</div>`;
} else {
    document.querySelector('#content').innerHTML = `<div class="subtitle">Ooops! Something went wrong...</div>`;
}

async function fetchNewReleases(accessToken) {
    try {
        const result = await fetch("https://api.spotify.com/v1/browse/new-releases", {
            method: "GET", headers: { Authorization: `Bearer ${accessToken}`}, credentials: 'omit' 
        });
    
        if (!result.ok) {
            switch (result.status) {
                case 400:
                    throw new Error("Bad Request: The request was invalid or cannot be served.");
                case 401:
                    throw new Error("Unauthorized: Invalid or expired access token.");
                case 404:
                    throw new Error("Not Found: The requested resorce do not exist.");
                case 500:
                    throw new Error("Server Error: Spotify API is currently unavailable.");
                default:
                    throw new Error(`Unexpected error: ${result.statusText} (${result.status})`);
            }
        }    
        const data = await result.json();
        return data.albums; // Assuming the data is nested under "albums"
    } catch (error) {
        console.error("Error fetching new albums list...\n", error.message);
        return { error: error.message };
    }
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
