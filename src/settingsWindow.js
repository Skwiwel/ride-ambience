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
    // onclick set tab
    tabSelector.onclick = function () {
      currTab.set(tabID);
    };
    currTab.addListener(function (val) {
      tabSelector.dataset.state = val == tabID ? true : false;
    });
  });

  tabContainers.forEach((tabContainer) => {
    // Devlare an empty function to be called on tab enable
    tabContainer._ra_initFunction = function () {};
    // Get corresponding tab id
    var tabID = tabContainer.id.split("-tab-container", 1)[0];
    currTab.addListener(function (val) {
      if (val == tabID) {
        tabContainer.dataset.enabled = true;
        tabContainer._ra_initFunction();
      } else {
        tabContainer.dataset.enabled = false;
      }
    });
  });

  /* Container init functions*/
  var videoListTabContainer = document.getElementById(
    "video-list-tab-container"
  );

  var videoListContainer = document.getElementById("video-list-container");
  // display video list
  videoListTabContainer._ra_initFunction = function () {
    var tempString = "";
    for (const video in videoList.links) {
      vid = videoList.links[`${video}`];
      tempString +=
        '<div class="list-object">' +
        '<div class="video-list-title">' +
        (vid.title == undefined ? "" : vid.title) +
        "</div>" +
        '<div class="video-list-ytID"><a href="https://www.youtube.com/watch?v=' +
        video +
        '">' +
        video +
        '</a></div><div class="video-list-start">' +
        formatTime(vid.startDefault) +
        '</div><div class="video-list-weight">' +
        vid.weight +
        "</div>" +
        '<div class="video-list-play">' +
        '<button class="menu-item" onclick=settingsWindow.videoPlay("' +
        video +
        '")><span class="jam jam-play"/></button>' +
        "</div>" +
        '<div class="list-object-delete">' +
        '<button class="menu-item" onclick=settingsWindow.videoDelete("' +
        video +
        '")><span class="jam jam-close"/></button>' +
        "</div></div>";
    }
    videoListContainer.innerHTML = tempString;
  };

  /* Video List tab helper functions */
  this.videoDelete = function (id) {
    if (videoList.delete(id)) videoListTabContainer._ra_initFunction();
  };
  this.videoPlay = function (id) {
    document.dispatchEvent(new CustomEvent("playVideo", { detail: id }));
  };
  var videoAddInput = document.getElementById("video-list-add-input");
  var videoAddButton = document.getElementById("video-list-add-button");
  videoAdd = function () {
    var url = videoAddInput.value;
    if (url == "") return;
    id = GetYouTubeID(url);
    var result = videoList.add(id);
    videoAddInput.placeholder = result;
    videoAddInput.value = "";
    if (result == "Added!") videoListTabContainer._ra_initFunction();
  };
  videoAddButton.onclick = videoAdd;
  videoAddInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      videoAdd();
    }
  });

  // init
  {
    currTab.set("video-list");
  }
})();
