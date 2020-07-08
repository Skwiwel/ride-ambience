var mainMenu = new (function () {
  const container = document.getElementById("main-menu-container");
  const buttonFullscreen = document.getElementById("fullscreen-enable-button");
  const buttonVideoControls = document.getElementById(
    "video-controls-enable-button"
  );

  buttonFullscreen.onclick = function () {
    globalSettings.fullscreen.set(!globalSettings.fullscreen.get());
    console.log(globalSettings.fullscreen.get());
  };
  updateFullscreenButton = function () {
    buttonFullscreen.dataset.state = globalSettings.fullscreen.get();
  };
  globalSettings.fullscreen.addListener(updateFullscreenButton);

  buttonVideoControls.onclick = function () {
    globalSettings.videoControls.set(!globalSettings.videoControls.get());
  };
  updateVideoControlsButton = function () {
    buttonVideoControls.dataset.state = globalSettings.videoControls.get();
  };
  globalSettings.videoControls.addListener(updateVideoControlsButton);

  // init
  {
    updateFullscreenButton();
    updateVideoControlsButton();
  }
})();
