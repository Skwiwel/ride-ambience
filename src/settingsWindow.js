import {globalSettings} from './globalSettings.js';
import {CheckboxButton} from './CheckboxButton.js';
import {EmittingVariable} from './EmittingVariable.js';
import {formatTime} from './formatTime.js';
import {videoModule} from './videoModule.js';
import {radioModule} from './radioModule.js';
import {applyTextAutoscroll} from './applyTextAutoscroll.js';
import {GetYouTubeID} from './GetYouTubeID.js';

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
   *  corresponding tab div is searched for. */
  var currTab = new EmittingVariable("video-list");

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

  /* Video List container init function*/
  var videoListTabContainer = document.getElementById(
    "video-list-tab-container"
  );
  var videoListContainer = document.getElementById("video-list-container");
  var videoAddInput = document.getElementById("video-list-add-input");
  var videoAddButton = document.getElementById("video-list-add-button");
  // display video list
  videoListTabContainer._ra_initFunction = function () {
    var tempString = "";
    for (const video in videoModule.list) {
      var vid = videoModule.list[`${video}`];
      tempString +=
        '<div class="list-object">' +
        '<div class="video-list-title text-autoscroll"><span>' +
        (vid.title == undefined ? "" : vid.title) +
        "</span></div>" +
        '<div class="video-list-ytID"><a href="https://www.youtube.com/watch?v=' +
        video +
        '">' +
        video +
        '</a></div><div class="video-list-relativeVolume"><input type="range" value="' +
        (vid.relativeVolume === undefined ? "20" : vid.relativeVolume*100) +
        '" oninput=\'videoChangeRelativeVolume("' +
        video +
        '", this.value);\'></div>' + 
        '<div class="video-list-weight">' +
        vid.weight +
        "</div>" +
        '<div class="list-play">' +
        '<button class="menu-item" onclick=videoPlay("' +
        video +
        '")><span class="jam jam-play"/></button>' +
        "</div>" +
        '<div class="list-object-delete">' +
        '<button class="menu-item" onclick=videoDelete("' +
        video +
        '")><span class="jam jam-close"/></button>' +
        "</div></div>";
    }
    videoListContainer.innerHTML = tempString;
    applyTextAutoscroll(videoListContainer);
    videoAddInput.placeholder = "Enter a YouTube url here to add a video";
  };
  window.videoChangeRelativeVolume = function (id, relativeVolume) {
    let volumeAdjustedForRange = relativeVolume / 100;
    videoModule.changeRelativeVolume(id, volumeAdjustedForRange);
  }
  /* Video List tab helper functions */
  this.videoDelete = function (id) {
    if (videoModule.delete(id)) videoListTabContainer._ra_initFunction();
  };
  window.videoDelete = this.videoDelete;
  this.videoPlay = function (id) {
    videoModule.currentVideo.set(videoModule.list[id]);
    videoModule.playing.set(true);
  };
  window.videoPlay = this.videoPlay;
  function videoAdd() {
    var url = videoAddInput.value;
    if (url == "") return;
    var id = GetYouTubeID(url);
    var result = videoModule.add(id);
    videoAddInput.placeholder = result;
    videoAddInput.value = "";
    if (result == "Added!") {
      videoListTabContainer._ra_initFunction();
      videoAddInput.placeholder = result;
    }
  }
  videoAddButton.onclick = videoAdd;
  videoAddInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      videoAdd();
    }
  });

  /* Radio List container init function*/
  var radioListTabContainer = document.getElementById(
    "radio-list-tab-container"
  );
  var radioListContainer = document.getElementById("radio-list-container");
  var radioAddInput = document.getElementById("radio-list-add-input");
  var radioAddButton = document.getElementById("radio-list-add-button");
  // display radio list
  radioListTabContainer._ra_initFunction = function () {
    var tempString = "";
    radioModule.list.forEach((radio) => {
      var split = radio.url.split("//");
      var urlShort = split[split.length - 1];
      tempString +=
        '<div class="list-object">' +
        '<div class="radio-list-name"><input type="text" value="' +
        (radio.name == undefined ? "" : radio.name) +
        '" oninput=\'radioChangeName("' +
        radio.url +
        '", this.value);\' spellcheck="false"></div>' +
        '<div class="radio-list-url text-autoscroll"><a href="' +
        radio.url +
        '">' +
        urlShort +
        "</a></div>" +
        '<div class="list-play">' +
        '<button class="menu-item" onclick=radioPlay("' +
        radio.url +
        '")><span class="jam jam-play"/></button>' +
        "</div>" +
        '<div class="list-object-delete">' +
        '<button class="menu-item" onclick=radioDelete("' +
        radio.url +
        '")><span class="jam jam-close"/></button>' +
        "</div></div>";
    });
    radioListContainer.innerHTML = tempString;
    applyTextAutoscroll(radioListContainer);
    radioAddInput.placeholder =
      "Enter an audio stream url here to add a radio station";
  };
  /* Radio List tab helper functions */
  this.radioDelete = function (url) {
    if (radioModule.deleteByURL(url)) radioListTabContainer._ra_initFunction();
  };
  window.radioDelete = this.radioDelete;
  this.radioPlay = function (url) {
    radioModule.playByURL(url);
  };
  window.radioPlay = this.radioPlay;
  this.radioChangeName = function (url, name) {
    radioModule.changeNameByURL(url, name);
  };
  window.radioChangeName = this.radioChangeName;
  function radioAdd() {
    var url = radioAddInput.value;
    if (url == "") return;
    var result = radioModule.addByURL(url);
    radioAddInput.placeholder = result;
    radioAddInput.value = "";
    if (result == "Added!") {
      radioListTabContainer._ra_initFunction();
      radioAddInput.placeholder = result;
    }
  }
  radioAddButton.onclick = radioAdd;
  radioAddInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      radioAdd();
    }
  });

  // init
  {
    currTab.set("video-list");
  }
})();
