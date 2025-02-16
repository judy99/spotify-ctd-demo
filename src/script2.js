const currentUrl = window.location.href;
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
// Log or use the ID
console.log('ID parameter:', id);

const savedAccessToken = localStorage.getItem("access_token");

const album = await fetchReleaseById(savedAccessToken, id);
console.log(`album ==== `, album)
showAlbum(album)

async function fetchReleaseById(savedAccessToken, id) {
    const result = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
        method: "GET", headers: { Authorization: `Bearer ${savedAccessToken}` }
    });

    const data = await result.json();
    return data
}

function renderArtists(artists) {
    return artists?.map((item) => `<li>${(item.name)}</li>`).join('');
  };

function renderTracks(tracks) {
    return tracks.map((track) => `<li>${(track.name)}</li>`).join('');
};




function showAlbum(data) {
    document.getElementById("albumType").innerText = data.album_type;
    // if (profile.images[0]) {
    //     const profileImage = new Image(200, 200);
    //     profileImage.src = profile.images[0].url;
    //     document.getElementById("avatar").appendChild(profileImage);
    //     document.getElementById("imgUrl").innerText = profile.images[0].url;
    // }
    const artists = renderArtists(data?.artists);
    const tracks = renderTracks(data?.tracks.items);

    // console.log(`artists = `, artists)
    document.getElementById("artists").innerHTML = `<ul>${artists}</ul>`;
    document.getElementById("tracks").innerHTML = `<ul>${tracks}</ul>`;

    // document.getElementById("email").innerText = profile.email;
    // document.getElementById("uri").innerText = profile.uri;
    // document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    // document.getElementById("url").innerText = profile.href;
    // document.getElementById("url").setAttribute("href", profile.href);
}
// album_type
// artists: [{name}]
// images: [height, weight, url]
// tracks: [{total, items: [{name}]}]
// popularity
