const clientId = "0bc687de481e4c8c916b14ea78f5dc90"; // my client ID
let code, params;
// creates a new URLSearchParams object 
// that provides methods to parse, access, and manipulate query parameters

function render(albums) {
    return albums?.items?.map((item) => `
    <div class="card">
    <a href="page2.html?id=${item.id}">
        <img src=${item.images[0].url} width=${item.images[0].width} height=${item.images[0].height} alt=${item.name} />
        <p class="album"> ${(item.name)}</p>
        <p class="artist"> ${item.artists.length > 1 ? "artists: " : "artist: "} ${(item.artists.map(artist => `<span>&nbsp;<strong>${artist.name}</strong></span>`))}</p>
    </a>
    </div>`)
    .join('');
  };

const queryString = window.location.search;
console.log(`queryString = `, queryString)

params = new URLSearchParams(queryString);
console.log(`params = `, params)
// Access code query parameter
code = params.get("code");
console.log(`code = `, code)


const savedAccessToken = localStorage.getItem("access_token");

if (!savedAccessToken) {
    if (!code) {
        redirectToAuthCodeFlow(clientId);
    } else {
        const accessToken = await getAccessToken(clientId, code);
        const releases = await fetchNewReleases(accessToken);
        const albums = render(releases);
        document.querySelector('#content').innerHTML = `<div class="grid">${albums}</div>`;
    }
} else {
    const releases = await fetchNewReleases(savedAccessToken);
    const albums = render(releases);
    document.querySelector('#content').innerHTML = `<div class="grid">${albums}</div>`;
}

// redirect the user to the Spotify authorization page
export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    // Convert digest to Base64 URL-safe string
    // Necessary for web-safe cryptographic data (e.g., OAuth PKCE)
    const challenge = await generateCodeChallenge(verifier);

    // store the verifier data, which works like a password for the token exchange process
    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    // redirect the user back to after they've authorized the application
    params.append("redirect_uri", "http://localhost:5173/callback"); // local Vite dev server
    // these are the scopes that allow us to fetch the user's profile data
    params.append("scope", "user-read-private user-read-email"); // list of permissions that we're requesting from the user
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// A typed array in JavaScript is an object that provides a way to work with raw binary data in memory.
// Once a typed array is created, its length is fixed and cannot be changed.
// Typed arrays represent data in a binary format and provide specific types (e.g., 8-bit integers, 32-bit floats).
// More efficient for numerical computations or handling large datasets, as they are closer to low-level memory representation.

async function generateCodeChallenge(codeVerifier) {
    // TextEncoder is a built-in JavaScript class that converts a string into a sequence of UTF-8 bytes
    // creating a Uint8Array (a typed array) representation of the codeVerifier string using the TextEncoder class
    // Uint8Array consists of 8-bit unsigned integer (1 byte each)
    const data = new TextEncoder().encode(codeVerifier); // Convert string to Uint8Array using TextEncoder
    // data must be an ArrayBuffer or a view of it (like Uint8Array), not a string.
    // The result is an ArrayBuffer. If you need a human-readable representation (e.g., a hexadecimal string), you must process the binary data
    const digest = await window.crypto.subtle.digest('SHA-256', data); // Compute SHA-256 hash
    // Convert digest to Base64 URL-safe string
    // Necessary for web-safe cryptographic data (e.g., OAuth PKCE)
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// In order to make sure that the token exchange works
export async function getAccessToken(clientId, code) {
    // load the verifier from local storage 
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier);

    // The API uses code and verifier to verify our request and it returns an access token
    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    console.log(`access_token:::: = `, access_token)
    localStorage.setItem("access_token", access_token);

    return access_token;
}

async function fetchNewReleases(accessToken) {
    const result = await fetch("https://api.spotify.com/v1/browse/new-releases", {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await result.json();
    console.log(`========================data = `, data)
    return data.albums; // Assuming the data is nested under "albums"

}

async function fetchReleaseById(accessToken, id) {
    const result = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await result.json();
    console.log(`data album = `, data)
    return 1
    // return data.albums; // Assuming the data is nested under "albums"

}


// async function fetchProfile(token) {
//     const result = await fetch("https://api.spotify.com/v1/me", {
//         method: "GET", headers: { Authorization: `Bearer ${token}` }
//     });

//     return await result.json();
// }

// function populateUI(profile) {
//     document.getElementById("displayName").innerText = profile.display_name;
//     if (profile.images[0]) {
//         const profileImage = new Image(200, 200);
//         profileImage.src = profile.images[0].url;
//         document.getElementById("avatar").appendChild(profileImage);
//         document.getElementById("imgUrl").innerText = profile.images[0].url;
//     }
//     document.getElementById("id").innerText = profile.id;
//     document.getElementById("email").innerText = profile.email;
//     document.getElementById("uri").innerText = profile.uri;
//     document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
//     document.getElementById("url").innerText = profile.href;
//     document.getElementById("url").setAttribute("href", profile.href);
// }

