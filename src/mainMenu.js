var mainMenu = new (function () {
  const container = document.getElementById("main-menu-container");
  const buttonSettings = new CheckboxButton(
    "settings-enable-button",
    globalSettings.settingsOpen
  );
  const buttonFullscreen = new CheckboxButton(
    "fullscreen-enable-button",
    globalSettings.fullscreen
  );
  const buttonVideoControls = new CheckboxButton(
    "video-controls-enable-button",
    globalSettings.videoControls
  );

  // init
  {
  }
})();
