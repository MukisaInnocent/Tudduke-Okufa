/* =========================================
   FORCE PAUSE OTHER YOUTUBE VIDEOS
   (NO HTML CHANGES REQUIRED)
========================================= */

// Load YouTube Iframe API
(function () {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
})();

let ytPlayers = [];

window.onYouTubeIframeAPIReady = function () {
  const iframes = document.querySelectorAll('iframe[src*="youtube.com/embed"]');

  iframes.forEach((iframe, index) => {
    // Add enablejsapi if missing
    if (!iframe.src.includes("enablejsapi=1")) {
      iframe.src += (iframe.src.includes("?") ? "&" : "?") + "enablejsapi=1";
    }

    // Add ID if missing
    if (!iframe.id) {
      iframe.id = "yt-player-" + index;
    }

    ytPlayers.push(
      new YT.Player(iframe.id, {
        events: {
          onStateChange: onYTStateChange
        }
      })
    );
  });
};

function onYTStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    ytPlayers.forEach(player => {
      if (player !== event.target) {
        player.pauseVideo();
      }
    });
  }
}
