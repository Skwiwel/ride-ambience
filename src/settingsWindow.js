var settingsWindow = new (function () {
  const container = document.getElementById("settings-container");

  globalSettings.settingsOpen.addListener(function (val) {
    container.dataset.enabled = val;
  });

  const buttonPresetFetch = new CheckboxButton(
    "preset-fetch-enable-button",
    globalSettings.presetFetch
  );

  /*  Applies logic to the tabs.
   *  For each button inside the "settings-tab-selector-container" a
   *  corresponding tab div is searched for.
   */
  var tabSelectors = document.querySelectorAll(
    "#settings-tab-selector-container > button"
  );
  var tabs = document.querySelectorAll("#settings-tab-container > div");
  tabSelectors.forEach((tabSelector) => {
    // Get corresponding tab id
    var selectorID = tabSelector.id;
    var tabID = selectorID.split("-selector", 1) + "-container";
    var targetTab = document.getElementById(tabID);
    // onclick hide other tabs and
    tabSelector.onclick = function () {
      tabSelectors.forEach((selector) => {
        selector.dataset.state = "disabled";
      });
      tabSelector.dataset.state = "enabled";
      tabs.forEach((tab) => {
        tab.dataset.enabled = false;
      });
      targetTab.dataset.enabled = true;
    };
  });

  // init
  {
    tabSelectors[0].dataset.state = "enabled";
    tabs[0].dataset.enabled = true;
  }
})();
