var radioControls = new (function () {
  var playing = new EmittingVariable(true);

  playButton = document.getElementById("radio-play");
  backwardButton = document.getElementById("radio-backward");
  forwardButton = document.getElementById("radio-forward");
  volumeButton = document.getElementById("radio-volume");
  volumeSlider = document.getElementById("radio-volume-slider");
  nameLabel = document.getElementById("radio-name-label");
  audio = document.getElementById("radio-audio");

  _this = this;

  /* Listen to changes in radio list current audio */
  radioList.currentAudio.addListener(function (radio) {
    // check if empty - no stations on the list
    if (radio.url === undefined) {
      playing.set(false);
      nameLabel.innerHTML = "";
    } else {
      audio.src = radio.url;
      nameLabel.innerHTML = radio.name;
      playing.set(playing.get()); // trigger listeners for a potential change
    }
  });

  /* Updates button appearance */
  function updatePlayButton(playing) {
    playButton.lastChild.className = playing ? "jam jam-pause" : "jam jam-play";
  }
  playing.addListener(updatePlayButton);

  /* Updates audio file playing */
  function updateAudioPlay(playing) {
    if (playing) {
      const playPromise = audio.play();
      /* A harmless expception happens on rapid radio station change */
      if (playPromise !== null) {
        playPromise.catch(() => {
          /* discard runtime error */
        });
      }
    } else {
      audio.pause();
    }
  }
  playing.addListener(updateAudioPlay);

  this.togglePlay = function () {
    if (radioList.getURL() !== undefined) playing.set(!playing.get());
  };
  playButton.onclick = this.togglePlay;

  backwardButton.onclick = radioList.prev;
  forwardButton.onclick = radioList.next;

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
    audio.src = radioList.getURL();
    nameLabel.innerHTML = radioList.getName();

    var cookieContentString = "";

    var cookieContentFloat = parseFloat(getCookie("radioVolume"));
    audio.volume = isNaN(cookieContentFloat) ? 0.3 : cookieContentFloat;
    volumeSlider.value = audio.volume;
    cookieContentString = getCookie("radioMuted");
    audio.muted = cookieContentString == "true" ? true : false;
    updateVolumeButton();

    cookieContentString = getCookie("radioPlay");
    playing.set(cookieContentString == "false" ? false : true);

    window.addEventListener("beforeunload", function () {
      setCookie("radioVolume", audio.volume);
      setCookie("radioMuted", audio.muted);
      setCookie("radioPlay", playing.get());
    });
  }
})();
