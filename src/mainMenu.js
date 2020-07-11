var mainMenu = new (function () {
  /**
   * Class to represent and add functionality to a generic checkbox button
   * id: html id of the button element
   * setting: an EmittingVariable object
   */
  function CheckboxButton(id, setting) {
    const button = document.getElementById(id);
    button.onclick = function () {
      setting.set(!setting.get());
    };
    this.update = function () {
      button.dataset.state = setting.get();
    };
    setting.addListener(this.update);
    // init
    {
      this.update();
    }
  }

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
