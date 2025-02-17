const clientId = "0bc687de481e4c8c916b14ea78f5dc90"; // my client ID
import {redirectToAuthCodeFlow, getAccessToken, savedAccessToken} from './auth'
let code, params, albums, data;

// creates a new URLSearchParams object 
// that provides methods to parse, access, and manipulate query parameters
const queryString = window.location.search;
console.log(`queryString = `, queryString)

params = new URLSearchParams(queryString);
console.log(`params = `, params)

// Access code query parameter
code = params.get("code");
console.log(`code = `, code)

if (!savedAccessToken) {
    if (!code) {
        redirectToAuthCodeFlow(clientId);
    } else {
        const accessToken = await getAccessToken(clientId, code);
        data = await fetchNewReleases(accessToken);
    }
} else {
    data = await fetchNewReleases(savedAccessToken);
}
albums = render(data);
document.querySelector('#content').innerHTML = `<div class="grid">${albums}</div>`;

async function fetchNewReleases(accessToken) {
    const result = await fetch("https://api.spotify.com/v1/browse/new-releases", {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
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
