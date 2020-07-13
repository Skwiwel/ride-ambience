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
  currTab = new EmittingVariable("video-list");

  var tabSelectors = document.querySelectorAll(
    "#settings-tab-selector-container > button"
  );
  var tabContainers = document.querySelectorAll(
    "#settings-tab-container > div"
  );

  tabSelectors.forEach((tabSelector) => {
    // Get corresponding tab id
    var tabID = tabSelector.id.split("-tab-selector", 1)[0];
    console.log(tabID);
    // onclick set tab
    tabSelector.onclick = function () {
      currTab.set(tabID);
    };
    currTab.addListener(function (val) {
      tabSelector.dataset.state = val == tabID ? true : false;
    });
  });

  tabContainers.forEach((tabContainer) => {
    // Get corresponding tab id
    var tabID = tabContainer.id.split("-tab-container", 1)[0];
    console.log(tabID);
    currTab.addListener(function (val) {
      tabContainer.dataset.enabled = val == tabID ? true : false;
    });
  });

  // init
  {
    currTab.set("video-list");
  }
})();
