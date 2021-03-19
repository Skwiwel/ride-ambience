import {videoModule} from './videoModule.js';
import {GetYouTubeID} from './GetYouTubeID.js';
import {loadScript} from './loadScript.js';

var updateTimeIntervalID;

loadScript("https://www.youtube.com/iframe_api", "YT");

// Loading the YT iframe script the CommonJS modules way causes weird shenanigans.
// For this reason onYouTubeIframeAPIReady() is called manually after making sure the script loaded.
var waitForYTScriptLoad = setInterval(function () {
  if(typeof YT !== 'undefined' && YT.loaded){
      onYouTubeIframeAPIReady();
      clearInterval(waitForYTScriptLoad);
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
      autoplay: 0,
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
  updateVolume();
  playPause(videoModule.playing.get());
  player.seekTo(videoModule.currentVideo.get().start);
  initializeVideoChangeListening()
}

function initializeVideoChangeListening() {
  videoModule.currentVideo.addListener(function (video) {
    // Don't change video if it's the same as currently playing
    if (video.id == GetYouTubeID(player.getVideoUrl())) return;
    // Videos have different relative volumes and thus volume has to be updated with each video change
    updateVolume()
    player.cueVideoById(video.id, video.start);
    if (videoModule.playing.get()) player.playVideo();
  });
}

function updateVolume(globalVolume = videoModule.volume.get()) {
  var volumeAdjustedToRelative = adjustVolumeToRelative(globalVolume);
  if (volumeAdjustedToRelative == player.getVolume() * 100) return;
  player.setVolume(volumeAdjustedToRelative * 100);
}

function adjustVolumeToRelative(globalVolume) {
  var volumeAdjustedToRelative = globalVolume;
  if (videoModule.currentVideo.get().relativeVolume !== undefined)
    var volumeAdjustedToRelative = volumeAdjustedToRelative * videoModule.currentVideo.get().relativeVolume;
  return volumeAdjustedToRelative;
}

videoModule.volume.addListener(function (volume) {
  updateVolume(volume);
});

videoModule.muted.addListener(function (muted) {
  if (muted == player.isMuted()) return;
  if (muted) player.mute();
  else player.unMute();
});

function playPause(shouldPlay) {
  if (shouldPlay) player.playVideo();
  else player.pauseVideo();
}
videoModule.playing.addListener(playPause);

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

function updateTime() {
  videoModule.time.set({
    current: player.getCurrentTime(),
    end: player.getDuration(),
  });
}
