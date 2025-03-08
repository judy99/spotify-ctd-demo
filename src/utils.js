export const errorHandling = (result) => {
  if (!result.ok) {
    switch (result.status) {
      case 400:
        throw new Error(
          "Bad Request: The request was invalid or cannot be served."
        );
      case 401:
        throw new Error("Unauthorized: Invalid or expired access token.");
      case 404:
        throw new Error("Not Found: The requested resorce do not exist.");
      case 500:
        throw new Error("Server Error: Spotify API is currently unavailable.");
      default:
        throw new Error(
          `Unexpected error: ${result.statusText} (${result.status})`
        );
    }
  }
};

export const showError = (error) => {
  return `<div class="subtitle">Something went wrong...<br>${error.error}<br><a href="/">Back to New Releases</div>`;
};

export const formatTimeDuration = (ms) => {
  if (isNaN(ms) || ms < 0) {
    return "00:00";
  }
  let minutes = Math.floor(ms / 60000);
  let seconds = Math.floor((ms % 60000) / 1000);
  let formattedSeconds = seconds.toString().padStart(2, "0");

  return `${minutes}:${formattedSeconds}`;
};
