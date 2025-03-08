import {
  redirectToAuthCodeFlow,
  getAccessToken,
  isTokenValid,
  clientId,
} from "./auth";
import { errorHandling, showError } from "./utils";

// first page
await indexPage();

async function indexPage() {
  let authCode, params, albums, data;
  const element = document.getElementById("container");

  // creates a new URLSearchParams object
  // that provides methods to parse, access, and manipulate query parameters
  const queryString = window.location.search;
  params = new URLSearchParams(queryString);
  // get code from query parameter to get the access token
  authCode = params.get("code");

  if (!isTokenValid()) {
    // show loader while fetching data
    element.classList.add("loader");
    // no valid token and no auth_code => redirect to the Spotify auth flow
    if (!authCode) {
      await redirectToAuthCodeFlow(clientId);
    } else {
      // no valid token and auth_code => go to the token exchange process and store the token in the local storage
      const [access_token, expirationTime] = await getAccessToken(
        clientId,
        authCode
      );
      // store the token and its expiration time in the local storage
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("access_token_expiry", expirationTime.toString());
    }
    // hide loader after fetching data
    element.classList.remove("loader");
  }

  const savedAccessToken = localStorage.getItem("access_token");

  element.classList.add("loader");
  // fetch new releases after we have a valid token
  data = await fetchNewReleases(savedAccessToken);
  element.classList.remove("loader");

  if (!data.error) {
    albums = render(data);
    document.querySelector(
      "#content"
    ).innerHTML = `<div class="subtitle">Click on a card for details</div><div class="grid">${albums}</div>`;
  } else {
    document.querySelector("#content").innerHTML = showError(data);
  }
}

// **************************************************************
// utility functions for rendering and fetching new releases

async function fetchNewReleases(accessToken) {
  try {
    const result = await fetch(
      "https://api.spotify.com/v1/browse/new-releases",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    errorHandling(result);

    const data = await result.json();

    return data.albums; // assuming the data is nested under "albums"
  } catch (error) {
    console.error("Error fetching new albums list...\n", error.message);
    return { error: error.message };
  }
}

function render(albums) {
  return albums?.items
    ?.map(
      (item) => `
    <div class="card">
    <a href="details.html?id=${item.id}">
        <img src=${item.images[0].url} width=${item.images[0].width} height=${
        item.images[0].height
      } alt=${item.name} />
        <p class="title"> ${item.name}</p>
        <p class="artist"> ${
          item.artists.length > 1 ? "artists: " : "artist: "
        } ${item.artists.map(
        (artist) => `<span>&nbsp;<strong>${artist.name}</strong></span>`
      )}</p>
    </a>
    </div>`
    )
    .join("");
}
