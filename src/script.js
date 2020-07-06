videoLinksFileURL =
  "https://raw.githubusercontent.com/Skwiwel/YT-Drive-Project/master/YouTube_Links";

var videoList = new (function () {
  this.links = {};
  this.save = function () {
    setCookie("VideoList", JSON.stringify(this.links));
  };
  this.increaseVideoWeight = function (videoId) {
    if (videoId == "") return;
    if (this.links[videoId] != undefined) {
      this.links[videoId].start = 0;
      this.links[videoId].weight += 1;
    } else {
      this.links[videoId] = { start: 0, weight: 1 };
    }
    this.save();
  };
  this.updateVideoTime = function (videoId, time) {
    this.links[videoId].start = time;
    if (this.links[videoId].weight == undefined) {
      this.links[videoId].weight = 0;
    }
    this.save();
  };
  this.getVideoStart = function (videoId) {
    if (this.links[videoId] == undefined) {
      return 0;
    } else {
      return this.links[videoId].start;
    }
  };
  // init
  {
    var cookieContentString = getCookie("VideoList");
    var _this = this;
    if (cookieContentString != "") {
      _this.links = JSON.parse(cookieContentString);
    }

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", videoLinksFileURL, false);
    rawFile.onload = function () {
      if (
        rawFile.readyState === 4 &&
        (rawFile.status === 200 || rawFile.status == 0)
      ) {
        var links = rawFile.responseText.split("\n");
        links.forEach((link) => {
          if (link == "") return;
          // get the id from yt URL
          var videoId = link.split("v=")[1];
          var ampersandPosition = videoId.indexOf("&");
          if (ampersandPosition != -1) {
            videoId = videoId.substring(0, ampersandPosition);
          }
          // if the id is new to the cookie add it
          if (_this.links[videoId] == undefined) {
            _this.links[videoId] = { start: 0, weight: 0 };
          }
        });
        setCookie("VideoList", JSON.stringify(_this.links));
      }
    };
    rawFile.send(null);
  }
})();

var videoControls = new (function () {
  var _this = this;
  this.enabled = false;
  var play = true;
  var containerDiv = document.getElementById("video-controls-container");
  var playButton = document.getElementById("video-play");
  var currentTimeText = document.getElementById("video-current-time");
  var overallTimeText = document.getElementById("video-overall-time");
  var progressBar = document.getElementById("video-progress-bar");

  this.toggleEnabled = function () {
    this.enabled = !this.enabled;
    updateVisibility();
    setCookie("videoControlsEnabled", this.enabled);
  };
  this.togglePlay = function () {
    play = !play;
    document.dispatchEvent(
      new CustomEvent("playPause", { detail: play ? "play" : "pause" })
    );
  };
  playButton.onclick = this.togglePlay;
  this.updateTime = function (timeCurr, timeOverall) {
    currentTimeText.innerHTML = formatTime(timeCurr);
    overallTimeText.innerHTML = formatTime(timeOverall);
  };
  this.updateProgressBar = function (timeCurr, timeOverall) {
    progressBar.value = (timeCurr / timeOverall) * progressBar.max;
  };
  updateVisibility = function () {
    containerDiv.dataset.enabled = _this.enabled;
  };
  // time formatting for display
  function formatTime(time) {
    if (time == undefined) return "-";
    time = Math.round(time);

    var hours = Math.floor(time / (60 * 60));
    var minutes = Math.floor((time - hours) / 60);
    var seconds = time - minutes * 60;

    minutes = hours > 0 && minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    var returnString = minutes + ":" + seconds;
    if (hours > 0) returnString = hours + ":" + returnString;
    return returnString;
  }
  progressBar.oninput = function () {
    document.dispatchEvent(
      new CustomEvent("progressBarInput", {
        detail: { value: progressBar.value, max: progressBar.max },
      })
    );
  };
  // init
  {
    if (getCookie("videoControlsEnabled") == "true") this.enabled = true;
    // if the cookie value is not set or is set to incorrect value
    else setCookie("videoControlsEnabled", "false");
    updateVisibility();
  }
})();

var radioControls = new (function () {
  this.playing = true;
  playButton = document.getElementById("radio-play");
  backwardButton = document.getElementById("radio-backward");
  forwardButton = document.getElementById("radio-forward");
  volumeButton = document.getElementById("radio-volume");
  volumeSlider = document.getElementById("radio-volume-slider");
  audio = document.getElementById("radio-audio");
  _this = this;
  this.togglePlay = function () {
    _this.playing = !_this.playing;
    playButton.dataset.state = _this.playing ? "paused" : "playing";
    _this.playing ? audio.play() : audio.pause();
  };
  playButton.onclick = this.togglePlay;
  this.toggleMute = function () {
    audio.muted = !audio.muted;
    updateVolumeButton();
  };
  volumeButton.onclick = this.toggleMute;
  volumeSlider.oninput = function () {
    audio.muted = false;
    audio.volume = volumeSlider.value;
    updateVolumeButton();
  };
  // The icons are implemented as fonts and chosen based on class name
  updateVolumeButton = function () {
    if (audio.muted) {
      volumeButton.lastChild.className = "jam jam-volume-mute";
    } else if (audio.volume > 0.5) {
      volumeButton.lastChild.className = "jam jam-volume-up";
    } else if (audio.volume > 0) {
      volumeButton.lastChild.className = "jam jam-volume-down";
    } else {
      volumeButton.lastChild.className = "jam jam-volume";
    }
  };
  // init
  {
    audio.volume = 0.75;
    volumeSlider.value = audio.volume;
    updateVolumeButton();
  }
})();

function findNextVideo() {
  var lowestWeight = Number.MAX_VALUE;
  var videos = [];
  for (const video in videoList.links) {
    var newWeight = videoList.links[`${video}`].weight;
    if (newWeight < lowestWeight) {
      lowestWeight = newWeight;
      videos = [`${video}`];
    } else if (newWeight == lowestWeight) {
      videos.push(`${video}`);
    }
  }
  // If every weight > 0 then subtract the weights by one.
  // Subject to possibly change in the future.
  if (lowestWeight > 0) {
    for (const video in videoList.links) {
      videoList.links[`${video}`].weight -= 1;
    }
  }
  // Return a random video from the choosen ones.
  if (videos.length == 0) return "";
  var i = Math.floor(Math.random() * videos.length);
  return videos[i];
}
