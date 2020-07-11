var settingsWindow = new (function () {
  const container = document.getElementById("settings-container");

  const buttonPresetFetch = new CheckboxButton(
    "preset-fetch-enable-button",
    globalSettings.presetFetch
  );

  globalSettings.settingsOpen.addListener(function () {
    container.dataset.enabled = globalSettings.settingsOpen.get();
  });

  // init
  {
  }
})();
