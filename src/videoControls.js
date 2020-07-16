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

  function togglePlay() {
    videoModule.playing.set(!videoModule.playing.get());
  }
  playButton.onclick = togglePlay;

  function updateTime(time = videoModule.time.get()) {
    currentTimeText.innerHTML = formatTime(time.current);
    overallTimeText.innerHTML = formatTime(time.end);
  }
  videoModule.time.addListener(updateTime);

  /* Listen to clicks on the progress bar
   * to ignore time updates from the video player */
  var progressBarClicked = false;
  progressBar.addEventListener("mousedown", () => {
    progressBarClicked = true;
  });
  progressBar.addEventListener("mouseup", () => {
    progressBarClicked = false;
  });
  function updateProgressBar(time = videoModule.time.get()) {
    if (progressBarClicked) return;
    progressBar.value = (time.current / time.end) * progressBar.max;
  }
  videoModule.time.addListener(updateProgressBar);

  function updatePlayButon(playing = videoModule.playing.get()) {
    playButton.lastChild.className = playing ? "jam jam-pause" : "jam jam-play";
  }
  videoModule.playing.addListener(updatePlayButon);

  function updateVolumeButon() {
    let muted = videoModule.muted.get();
    let volume = videoModule.volume.get();
    if (muted) {
      volumeButton.lastChild.className = "jam jam-volume-mute";
    } else if (volume > 0.5) {
      volumeButton.lastChild.className = "jam jam-volume-up";
    } else if (volume > 0) {
      volumeButton.lastChild.className = "jam jam-volume-down";
    } else {
      volumeButton.lastChild.className = "jam jam-volume";
    }
  }
  videoModule.muted.addListener(updateVolumeButon);
  videoModule.volume.addListener(updateVolumeButon);

  function updateVolumeSlider(volume = videoModule.volume.get()) {
    volumeSlider.value = volume * volumeSlider.max;
  }

  function updateVisibility(visible = globalSettings.videoControls.get()) {
    containerDiv.dataset.enabled = visible;
  }
  globalSettings.videoControls.addListener(updateVisibility);

  progressBar.oninput = function () {
    time = videoModule.time.get();
    time.current = time.end * (progressBar.value / progressBar.max);
    videoModule.time.set(time);
  };

  function toggleMute() {
    videoModule.muted.set(!videoModule.muted.get());
  }
  volumeButton.onclick = toggleMute;

  volumeSlider.oninput = function () {
    videoModule.volume.set(volumeSlider.value / volumeSlider.max);
  };

  // init
  {
    updateVisibility();
    updateTime();
    updateProgressBar();
    updatePlayButon();
    updateVolumeButon();
    updateVolumeSlider();
  }
})();
