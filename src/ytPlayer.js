import {videoModule} from './videoModule.js';
import {GetYouTubeID} from './GetYouTubeID.js';
import {loadScript} from './loadScript.js';

var updateTimeIntervalID;

loadScript("https://www.youtube.com/iframe_api", "YT");

// Loading the YT iframe script the CommonJS modules way causes weird shenanigans.
// For this reason onYouTubeIframeAPIReady() is called manually after making sure the script loaded.
var checkYT = setInterval(function () {
  if(YT && YT.loaded){
      onYouTubeIframeAPIReady();
      clearInterval(checkYT);
  }
}, 100);

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    videoId: videoModule.currentVideo.get().id,
    playerVars: {
      fs: 0,
      autoplay: 1,
      controls: 0,
      enablejsapi: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      start: videoModule.currentVideo.get().start,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}
// The API will call this function when the video player is ready.
function onPlayerReady(event) {
  player.playVideo();
  player.seekTo(videoModule.currentVideo.get().start);
  // Listen to video changes, but only after being ready (onPlayerReady)
  videoModule.currentVideo.addListener(function (video) {
    // Don't change video if it's the same as currently playing
    if (video.id == GetYouTubeID(player.getVideoUrl())) return;
    player.cueVideoById(video.id, video.start);
    if (videoModule.playing.get()) player.playVideo();
  });
}

function updateTime() {
  videoModule.time.set({
    current: player.getCurrentTime(),
    end: player.getDuration(),
  });
}

videoModule.playing.addListener(function (playing) {
  if (playing) player.playVideo();
  else player.pauseVideo();
});

videoModule.volume.addListener(function (volume) {
  if (volume == player.getVolume() * 100) return;
  player.setVolume(volume * 100);
});

videoModule.muted.addListener(function (muted) {
  if (muted == player.isMuted()) return;
  if (muted) player.mute();
  else player.unMute();
});

videoModule.time.addListener(function (time) {
  let playerTime = player.getCurrentTime();
  let difference = Math.abs(playerTime - time.current);
  // if the time difference is smaller than 2 seconds, ignore
  if (difference < 2) return;
  player.seekTo(time.current);
});

// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.UNSTARTED:
      clearInterval(updateTimeIntervalID);
      break;
    case YT.PlayerState.ENDED:
      videoModule.increaseVideoWeight(videoModule.currentVideo.get().id);
      videoModule.findNextVideo();
      clearInterval(updateTimeIntervalID);
      break;
    case YT.PlayerState.PLAYING:
      updateTime();
      // Update time every second
      updateTimeIntervalID = setInterval(updateTime, 1000);
      /*  Set video title
       *  getVideoData() was previously removed and is currently not documented
       *  for this reason better to check if it even exists */
      if (player.getVideoData !== undefined) {
        let data = player.getVideoData();
        videoModule.setTitle(data.video_id, data.title);
      }
      break;
    case YT.PlayerState.PAUSED:
      clearInterval(updateTimeIntervalID);
      break;
    case YT.PlayerState.BUFFERING:
      clearInterval(updateTimeIntervalID);
      break;
    default:
      clearInterval(updateTimeIntervalID);
  }
}
