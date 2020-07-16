/* Manages the main menu radio UI */
var radioControls = new (function () {
  playButton = document.getElementById("radio-play");
  backwardButton = document.getElementById("radio-backward");
  forwardButton = document.getElementById("radio-forward");
  volumeButton = document.getElementById("radio-volume");
  volumeSlider = document.getElementById("radio-volume-slider");
  nameLabel = document.getElementById("radio-name-label");

  _this = this;

  /* Listen to changes in current audio */
  radioModule.currentAudio.addListener(function (radio) {
    // check if empty - no stations on the list
    if (radio.url === undefined) nameLabel.innerHTML = "";
    else nameLabel.innerHTML = radio.name;
  });

  /* If loading of the audio stream fails */
  radioModule.audio.addEventListener("error", function () {
    nameLabel.innerHTML += "<br>Error: cannot load the audio stream";
  });

  this.togglePlay = function () {
    if (radioModule.getURL() !== undefined)
      radioModule.playing.set(!radioModule.playing.get());
  };
  playButton.onclick = this.togglePlay;

  backwardButton.onclick = radioModule.prev;
  forwardButton.onclick = radioModule.next;

  this.toggleMute = function () {
    radioModule.muted.set(!radioModule.muted.get());
  };
  volumeButton.onclick = this.toggleMute;

  volumeSlider.oninput = function () {
    if (radioModule.muted.get() == true) radioModule.muted.set(false);
    radioModule.volume.set(volumeSlider.value);
  };

  /* Dynamic appearance updates */
  /* The icons are implemented as fonts and chosen based on class name */

  /* Updates play button appearance */
  function updatePlayButton(playing = radioModule.playing.get()) {
    playButton.lastChild.className = playing ? "jam jam-pause" : "jam jam-play";
  }
  radioModule.playing.addListener(updatePlayButton);

  /* Updates volume button appearance */
  updateVolumeButton = function () {
    if (radioModule.muted.get()) {
      volumeButton.lastChild.className = "jam jam-volume-mute";
    } else if (radioModule.volume.get() > 0.5) {
      volumeButton.lastChild.className = "jam jam-volume-up";
    } else if (radioModule.volume.get() > 0) {
      volumeButton.lastChild.className = "jam jam-volume-down";
    } else {
      volumeButton.lastChild.className = "jam jam-volume";
    }
  };
  radioModule.volume.addListener(updateVolumeButton);
  radioModule.muted.addListener(updateVolumeButton);

  /* Updates volume slider value */
  updateVolumeSlider = function (volume = radioModule.volume.get()) {
    volumeSlider.value = volume;
  };
  radioModule.volume.addListener(updateVolumeSlider);

  // init
  {
    nameLabel.innerHTML = radioModule.getName();
    updatePlayButton();
    updateVolumeButton();
    updateVolumeSlider();
  }
})();
