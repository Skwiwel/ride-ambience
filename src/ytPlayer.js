var videoId = "";

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    videoId: videoId,
    playerVars: {
      fs: 0,
      modestbranding: 1,
      start: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
  videoId = findNextVideo();
  event.target.cueVideoById(videoId, getVideoStart(videoId));
  event.target.playVideo();
}

// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    increaseVideoWeight(videoId);
    videoId = findNextVideo();
    player.loadVideoById({ videoId: videoId });
  }
}

window.onbeforeunload = function () {
  // If the window is closed with only this much time left the video is considered finished
  const timeToEndCutoff = 20;
  // If the window is closed with only this much time elapsed from the beggining the video is considered not started
  const timeFromBeginningCutoff = 10;

  var currTime = player.getCurrentTime();
  if (player.getDuration() - currTime <= timeToEndCutoff) {
    increaseVideoWeight(videoId);
  } else {
    if (currTime > timeFromBeginningCutoff) updateVideoTime(videoId, currTime);
    else updateVideoTime(videoId, 0);
  }
};
