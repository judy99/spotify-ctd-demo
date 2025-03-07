export const clientId = "0bc687de481e4c8c916b14ea78f5dc90";
export const savedAccessToken = localStorage.getItem("access_token");

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

  // Request User Authorization
  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

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
  const digest = await window.crypto.subtle.digest("SHA-256", data); // Compute SHA-256 hash
  // Convert digest to Base64 URL-safe string
  // Necessary for web-safe cryptographic data (e.g., OAuth PKCE)
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
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
    body: params,
    mode: "cors",
    credentials: "include",
  });

  // expires_in - in seconds, 1 hour by default
  const { access_token, expires_in } = await result.json();

  const expirationTime = Date.now() + expires_in * 1000;

  //   TODO:remove this code
  // store the token and its expiration time in the local storage
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("access_token_expiry", expirationTime.toString());

  return access_token;
}

export function isTokenValid() {
  const token = localStorage.getItem("access_token");
  const expiry = localStorage.getItem("access_token_expiry");

  // remove the token if it's not valid
  if (
    !token ||
    token == "undefined" ||
    expiry == "NaN" ||
    !expiry ||
    Number(Date.now()) > Number(expiry)
  ) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("access_token_expiry");
    return false;
  }
  return true;
}
