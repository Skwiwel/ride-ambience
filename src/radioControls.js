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
    var cookieContentString = "";
    audio.src = radioList.getURL();
    nameLabel.innerHTML = radioList.getName();

    var cookieContentFloat = parseFloat(getCookie("radioVolume"));
    audio.volume = isNaN(cookieContentFloat) ? 0.3 : cookieContentFloat;
    volumeSlider.value = audio.volume;
    cookieContentString = getCookie("radioMuted");
    audio.muted = cookieContentString == "true" ? true : false;
    updateVolumeButton();

    cookieContentString = getCookie("radioPlay");
    _this.playing = cookieContentString == "false" ? false : true;
    updateAudioPlaying();

    window.addEventListener("beforeunload", function () {
      setCookie("radioVolume", audio.volume);
      setCookie("radioMuted", audio.muted);
      setCookie("radioPlay", _this.playing);
    });
  }
})();
