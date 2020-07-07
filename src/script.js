const videoLinksFileURL =
  "https://raw.githubusercontent.com/Skwiwel/YT-Drive-Project/master/YouTube_Links";
const radioListFileURL =
  "https://raw.githubusercontent.com/Skwiwel/YT-Drive-Project/master/Radio_Links";

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

var radioList = new (function () {
  var _this = this;
  this.links = [];
  var current = -1;
  this.getURL = function () {
    return _this.links[current].url;
  };
  this.getName = function () {
    return _this.links[current].name;
  };
  this.next = function () {
    ++current;
    if (current >= _this.links.length) current = 0;
  };
  this.prev = function () {
    --current;
    if (current < 0) current = _this.links.length - 1;
  };
  this.save = function () {
    setCookie("RadioList", JSON.stringify(this.links));
  };
  // Init
  {
    var cookieContentString = getCookie("RadioList");
    if (cookieContentString != "") {
      _this.links = JSON.parse(cookieContentString);
    }
    /* Load the preset links from site */
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", radioListFileURL, false);
    rawFile.onload = function () {
      if (
        rawFile.readyState === 4 &&
        (rawFile.status === 200 || rawFile.status == 0)
      ) {
        var links = rawFile.responseText.split("\n");
        links.forEach((link) => {
          if (link == "") return;
          var split = link.split(" ");
          var url = split[0];
          split.shift(); // delete the url part
          var name = split.join(" ");
          // if the id is new to the cookie add it
          if (_this.links.some((e) => e.url == url) == false) {
            _this.links.push({ url: url, name: name });
          }
        });
        _this.links.sort((e1, e2) => e1.name.localeCompare(e2.name));
        _this.save();
      }
    };
    rawFile.send(null);

    var cookieContentString = getCookie("radioListLastPlayed");
    if (cookieContentString != "") {
      current = _this.links.findIndex((e) => e.name == cookieContentString);
    }
    /* set initial value of 0 if there is an incorrect one in the cookie */
    if (current == -1) current = 0;

    /* save the current station before leaving the site */
    window.addEventListener("beforeunload", function () {
      setCookie("radioListLastPlayed", _this.links[current].name);
    });
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
    updateButtonAppearance();
    /* Dispatch event for a video player */
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
  updateButtonAppearance = function () {
    /* Change play button appearance */
    if (play) {
      playButton.lastChild.className = "jam jam-pause";
    } else {
      playButton.lastChild.className = "jam jam-play";
    }
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
    updateButtonAppearance();
  }
})();

var radioControls = new (function () {
  this.playing = true;
  playButton = document.getElementById("radio-play");
  backwardButton = document.getElementById("radio-backward");
  forwardButton = document.getElementById("radio-forward");
  volumeButton = document.getElementById("radio-volume");
  volumeSlider = document.getElementById("radio-volume-slider");
  nameLabel = document.getElementById("radio-name-label");
  audio = document.getElementById("radio-audio");
  _this = this;
  updateAudioPlaying = function () {
    if (_this.playing) {
      playButton.lastChild.className = "jam jam-pause";
      audio.play();
    } else {
      playButton.lastChild.className = "jam jam-play";
      audio.pause();
    }
  };
  this.togglePlay = function () {
    _this.playing = !_this.playing;
    updateAudioPlaying();
  };
  playButton.onclick = this.togglePlay;
  this.toggleMute = function () {
    audio.muted = !audio.muted;
    updateVolumeButton();
  };
  backwardButton.onclick = function () {
    radioList.prev();
    audio.src = radioList.getURL();
    nameLabel.innerHTML = radioList.getName();
    updateAudioPlaying();
  };
  forwardButton.onclick = function () {
    radioList.next();
    audio.src = radioList.getURL();
    nameLabel.innerHTML = radioList.getName();
    updateAudioPlaying();
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
    var cookieContentString = "";
    audio.src = radioList.getURL();
    nameLabel.innerHTML = radioList.getName();

    var cookieContentFloat = parseFloat(getCookie("radioVolume"));
    audio.volume = cookieContentFloat == NaN ? 0.75 : cookieContentFloat;
    volumeSlider.value = audio.volume;
    cookieContentString = getCookie("radioMuted");
    audio.muted = cookieContentString == "true" ? true : false;
    updateVolumeButton();

    cookieContentString = getCookie("radioPlay");
    _this.playing = cookieContentString == "true" ? true : false;
    updateAudioPlaying();

    window.addEventListener("beforeunload", function () {
      setCookie("radioVolume", audio.volume);
      setCookie("radioMuted", audio.muted);
      setCookie("radioPlay", _this.playing);
    });
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
