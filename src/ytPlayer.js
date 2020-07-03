var VIDEO_ID = "";

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
    videoId: VIDEO_ID,
    playerVars: {
      fs: 0,
      autoplay: 1,
      controls: 0,
      enablejsapi: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      start: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}
//player.controls = 0;
for (const prop in player) {
  console.log(`player.${prop} = ${player[prop]}`);
}
// The API will call this function when the video player is ready.
function onPlayerReady(event) {
  VIDEO_ID = findNextVideo();
  // Load and play
  player.cueVideoById(VIDEO_ID, videoList.getVideoStart(VIDEO_ID));
  player.playVideo();
  // Initial update of display
  videoControls.updateTime(player.getCurrentTime(), player.getDuration());
  updateDisplayInterval = setInterval(function () {
    videoControls.updateTime(player.getCurrentTime(), player.getDuration());
    videoControls.updateProgressBar(
      player.getCurrentTime(),
      player.getDuration()
    );
  }, 1000);
}

// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    videoList.increaseVideoWeight(VIDEO_ID);
    VIDEO_ID = findNextVideo();
    player.loadVideoById({ videoId: VIDEO_ID });
  }
}

document.addEventListener("progressBarInput", function (e) {
  var newTime = player.getDuration() * (e.detail.value / e.detail.max);
  // Skip video to new time.
  player.seekTo(newTime);
  // Update Video Controls time display
  videoControls.updateTime(player.getCurrentTime(), player.getDuration());
});

document.addEventListener("playPause", function (e) {
  e.detail == "pause" ? player.pauseVideo() : player.playVideo();
});

window.onbeforeunload = function () {
  // If the window is closed with only this much time left the video is considered finished
  const timeToEndCutoff = 20;
  // If the window is closed with only this much time elapsed from the beggining the video is considered not started
  const timeFromBeginningCutoff = 10;

  var currTime = player.getCurrentTime();
  if (player.getDuration() - currTime <= timeToEndCutoff) {
    videoList.increaseVideoWeight(VIDEO_ID);
  } else {
    if (currTime > timeFromBeginningCutoff)
      videoList.updateVideoTime(VIDEO_ID, currTime);
    else videoList.updateVideoTime(VIDEO_ID, 0);
  }
};
