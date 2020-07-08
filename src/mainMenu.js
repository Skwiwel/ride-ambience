var mainMenu = new (function () {
  const container = document.getElementById("main-menu-container");
  const buttonVideoControls = document.getElementById(
    "video-controls-enable-button"
  );
  buttonVideoControls.onclick = function () {
    globalSettings.videoControls.set(!globalSettings.videoControls.get());
  };
  updateVideoControlsButton = function () {
    buttonVideoControls.dataset.state = globalSettings.videoControls.get();
  };
  globalSettings.videoControls.addListener(updateVideoControlsButton);
  // init
  {
    updateVideoControlsButton();
  }
})();
