var videoControls = new (function () {
  var play = true;
  var muted = false;
  var volume = 0.75;
  var containerDiv = document.getElementById("video-controls-container");
  var playButton = document.getElementById("video-play");
  var volumeButton = document.getElementById("video-volume");
  var volumeSlider = document.getElementById("video-volume-slider");
  var currentTimeText = document.getElementById("video-current-time");
  var overallTimeText = document.getElementById("video-overall-time");
  var progressBar = document.getElementById("video-progress-bar");

  const _this = this;

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
    if (muted) {
      volumeButton.lastChild.className = "jam jam-volume-mute";
    } else if (volume > 0.5) {
      volumeButton.lastChild.className = "jam jam-volume-up";
    } else if (volume > 0) {
      volumeButton.lastChild.className = "jam jam-volume-down";
    } else {
      volumeButton.lastChild.className = "jam jam-volume";
    }
  };
  updateVisibility = function () {
    containerDiv.dataset.enabled = globalSettings.videoControls.get();
  };
  globalSettings.videoControls.addListener(updateVisibility);
  // time formatting for display
  function formatTime(time) {
    if (time == undefined) return "-";
    time = Math.round(time);

    var hours = Math.floor(time / (60 * 60));
    time = time - hours * 60 * 60;
    var minutes = Math.floor(time / 60);
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
  this.getMute = function () {
    return muted;
  };
  this.setMute = function (mute) {
    muted = mute;
    document.dispatchEvent(
      new CustomEvent("videoVolumeToggleMute", {
        detail: muted ? "mute" : "unmute",
      })
    );
    updateButtonAppearance();
  };
  this.toggleMute = function () {
    _this.setMute(!muted);
  };
  volumeButton.onclick = this.toggleMute;
  this.getVolume = function () {
    return volume;
  };
  this.setVolume = function (vol, max) {
    volume = vol;
    document.dispatchEvent(
      new CustomEvent("videoVolumeSliderInput", {
        detail: { volume: vol, max: max },
      })
    );
    updateButtonAppearance();
  };
  volumeSlider.oninput = function () {
    _this.setVolume(volumeSlider.value, volumeSlider.max);
  };
  // init
  {
    updateVisibility();

    var cookieContentFloat = parseFloat(getCookie("videoVolume"));
    _this.setVolume(
      isNaN(cookieContentFloat) ? 0.75 : cookieContentFloat,
      volumeSlider.max
    );
    volumeSlider.value = volume;
    cookieContentString = getCookie("videoMuted");
    _this.setMute(cookieContentString == "true" ? true : false);
    updateButtonAppearance();

    window.addEventListener("beforeunload", function () {
      setCookie("videoVolume", volume);
      setCookie("videoMuted", muted);
    });
  }
})();
