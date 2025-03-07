import { redirectToAuthCodeFlow, isTokenValid, clientId } from "./auth";
// TODO:Refactor this code to use the fetchReleaseById function

const savedAccessToken = localStorage.getItem("access_token");
const verifierCode = localStorage.getItem("verifier");

if (!isTokenValid() || !verifierCode) {
  redirectToAuthCodeFlow(clientId);
}

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

let album;
let data;

data = await fetchReleaseById(savedAccessToken, id);

if (!data.error) {
  album = render(data);
  document.querySelector("#content").innerHTML = `${album}`;
} else {
  document.querySelector(
    "#content"
  ).innerHTML = `<div class="subtitle">Ooops! Something went wrong...</div>`;
}

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

    if (!result.ok) {
      switch (result.status) {
        case 400:
          throw new Error(
            "Bad Request: The request was invalid or cannot be served."
          );
        case 401:
          throw new Error("Unauthorized: Invalid or expired access token.");
        case 404:
          throw new Error("Not Found: The requested album does not exist.");
        case 500:
          throw new Error(
            "Server Error: Spotify API is currently unavailable."
          );
        default:
          throw new Error(
            `Unexpected error: ${result.statusText} (${result.status})`
          );
      }
    }
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error fetching album:", error.message);
    return { error: error.message };
  }
}

function formatTimeDuration(ms) {
  if (isNaN(ms) || ms < 0) {
    return "00:00";
  }
  let minutes = Math.floor(ms / 60000);
  let seconds = Math.floor((ms % 60000) / 1000);
  let formattedSeconds = seconds.toString().padStart(2, "0");

  return `${minutes}:${formattedSeconds}`;
}
