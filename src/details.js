import { redirectToAuthCodeFlow, isTokenValid, clientId } from "./auth";
import { errorHandling, showError, formatTimeDuration } from "./utils";

// second page
await detailsPage();

async function detailsPage() {
  const element = document.getElementById("container");
  const savedAccessToken = localStorage.getItem("access_token");
  const verifierCode = localStorage.getItem("verifier");
  let album;
  let data;

  if (!isTokenValid() || !verifierCode) {
    redirectToAuthCodeFlow(clientId);
  }

  // get id from url parameters to request the album details
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  // start showing the loader
  element.classList.add("loader");
  data = await fetchReleaseById(savedAccessToken, id);
  // stop showing loader
  element.classList.remove("loader");

  // render the album details
  if (!data.error) {
    album = render(data);
    document.querySelector("#content").innerHTML = `${album}`;
  } else {
    document.querySelector("#content").innerHTML = showError(data);
  }
}

// **************************************************************
// utility functions for rendering and fetching the album details
function render(item) {
  return `
    <div class="album">
        <div id="album" class="albumTitle">${
          item.name
        } <span id="albumType" class="albumType">(${
    item.album_type
  })</span></div>
        <div class="albumArtists">
            <h3>Artist:</h3>  
            <ul>${renderArtists(item?.artists)}<ul>
        </div>
        <div class="albumContent">
            <div class="albumTracks">
                <h3>Tracks:</h3>
                <ul>${renderTracks(item?.tracks?.items)}<ul>
            </div>
            <img src=${item.images[0].url} width=${
    item.images[0].width
  } height=${item.images[0].height} alt=${item.name} />
        </div> 
    </div>`;
}

function renderArtists(artists) {
  return artists?.map((item) => `<li>${item.name}</li>`).join("");
}

function renderTracks(tracks) {
  return tracks
    ?.map(
      (track) =>
        `<li class="track">${
          track.name
        }: <span class="trackDuration">${formatTimeDuration(
          track.duration_ms
        )}</span></li>`
    )
    .join("");
}

async function fetchReleaseById(savedAccessToken, id) {
  try {
    const result = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${savedAccessToken}` },
    });

    errorHandling(result);

    const data = await result.json();

    return data;
  } catch (error) {
    console.error("Error fetching album:", error.message);
    return { error: error.message };
  }
}
