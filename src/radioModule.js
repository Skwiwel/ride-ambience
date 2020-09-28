import {EmittingVariable} from './EmittingVariable.js';
import {setCookie, getCookie} from './cookieOperations.js';
import {globalSettings} from './globalSettings.js';

const radioListFileURL =
  "https://raw.githubusercontent.com/Skwiwel/ride-ambience/master/radio_presets.json";

/*  The radioModule manages the:
 *  - audio stream url list
 *  - audio html element
 *  - currently playing audio stream
 *  - fetching the preset radio stations
 */
export var radioModule = new (function () {
  var _this = this;

  function RadioLink(url, name = "") {
    this.url = url;
    this.name = name;
  }

  this.list = [];

  var currentID = -1;
  this.playing = new EmittingVariable(true);
  /* Contains a RadioLink or an empty object if there are none on the list */
  this.currentAudio = new EmittingVariable({});
  this.volume = new EmittingVariable(0.3);
  this.muted = new EmittingVariable(false);

  this.audio = document.createElement("AUDIO");

  /* Updates audio file playing */
  this.playing.addListener(updateAudioPlay);
  function updateAudioPlay(playing) {
    if (playing) {
      const playPromise = _this.audio.play();
      /* A harmless expception happens on rapid radio station change */
      if (playPromise !== null) {
        playPromise.catch(() => {
          /* discard runtime error */
        });
      }
    } else {
      _this.audio.pause();
    }
  }
  /* Updates audio volume */
  this.volume.addListener(function (volume) {
    _this.audio.volume = volume;
  });
  /* Updates audio mute */
  this.muted.addListener(function (muted) {
    _this.audio.muted = muted;
  });

  /* Save cookies on changes */
  this.currentAudio.addListener(function (radio) {
    setCookie("radioListLastPlayed", radio.url);
  });
  this.playing.addListener(function (playing) {
    setCookie("radioPlay", playing);
  });
  this.volume.addListener(function (volume) {
    setCookie("radioVolume", volume);
  });
  this.muted.addListener(function (muted) {
    setCookie("radioMuted", muted);
  });

  /* If loading of the audio stream fails */
  this.audio.addEventListener("error", function () {
    _this.playing.set(false);
  });

  /* Handle relevant changes to the list in regards to playing of the audio */
  this.currentAudio.addListener(function (radio) {
    // check if empty - no stations on the list
    if (radio.url === undefined) {
      _this.playing.set(false);
    } else {
      if (_this.audio.src != radio.url) {
        _this.audio.src = radio.url;
      }
      // trigger listeners for a potential change
      _this.playing.set(_this.playing.get());
    }
  });

  this.getURL = function () {
    return _this.currentAudio.get().url;
  };
  this.getName = function () {
    return _this.currentAudio.get().name;
  };

  this.next = function () {
    if (_this.list.length == 0) return;
    ++currentID;
    if (currentID >= _this.list.length) currentID = 0;
    _this.currentAudio.set(_this.list[currentID]);
  };
  this.prev = function () {
    if (_this.list.length == 0) return;
    --currentID;
    if (currentID < 0) currentID = _this.list.length - 1;
    _this.currentAudio.set(_this.list[currentID]);
  };

  this.playByURL = function (url) {
    var id = _this.list.findIndex((e) => e.url == url);
    if (id === -1) return;
    currentID = id;
    _this.currentAudio.set(_this.list[currentID]);
    _this.playing.set(true);
  };

  this.deleteByURL = function (url) {
    var id = _this.list.findIndex((e) => e.url == url);
    if (id === -1) return false;
    _this.list.splice(id, 1);
    if (_this.list.length == 0) {
      currentID = 0;
      _this.currentAudio.set({});
    } else if (currentID > id) {
      currentID--; // The indexes shifted as a result of the deletion
    } else if (currentID == id) {
      _this.prev(); // Play the previous station
    }
    _this.save();
    return true;
  };

  this.addByURL = function (url) {
    var id = _this.list.findIndex((e) => e.url == url);
    if (id !== -1) return "Error: This url is already on the list.";
    _this.list.push(new RadioLink(url));
    // Check if the array was empty previously. Trigger play if that's the case.
    if (_this.list.length == 1) {
      currentID = 0;
      _this.currentAudio.set(_this.list[currentID]);
    }
    _this.save();
    return "Added!";
  };

  this.changeNameByURL = function (url, name) {
    var id = _this.list.findIndex((e) => e.url == url);
    if (id === -1) return;
    _this.list[id].name = name;
    _this.save();
    // Update current audio to reflect the name change
    if (id == currentID) _this.currentAudio.set(_this.list[currentID]);
  };

  this.save = function () {
    setCookie("RadioList", JSON.stringify(this.list));
  };

  // Init
  {
    var cookieContentString = getCookie("RadioList");
    if (cookieContentString != "") {
      _this.list = JSON.parse(cookieContentString);
    }
    /* Load the preset list from site if presetFetch is enabled */
    if (
      globalSettings.preset.get().localeCompare("Custom") != 0 &&
      globalSettings.presetFetch.get()
    ) {
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", radioListFileURL, false);
      rawFile.onload = function () {
        if (
          rawFile.readyState === 4 &&
          (rawFile.status === 200 || rawFile.status == 0)
        ) {
          var rawText = rawFile.responseText;
          var presets = JSON.parse(rawText);
          var list = presets[globalSettings.preset.get()].list;
          list.forEach((link) => {
            if (link.url === undefined || link.url == "") return;
            // if the id is new to the cookie add it
            if (_this.list.some((e) => e.url == link.url) == false) {
              _this.list.push(link);
            }
          });
          _this.list.sort((e1, e2) => e1.name.localeCompare(e2.name));
          _this.save();
          // Set default radio
          let defaultURL = presets[globalSettings.preset.get()].default;
          currentID = _this.list.findIndex((e) => e.url == defaultURL);
        }
      };
      rawFile.send(null);
    }

    var cookieContentString = getCookie("radioListLastPlayed");
    if (cookieContentString != "") {
      let savedID = _this.list.findIndex((e) => e.url == cookieContentString);
      currentID = savedID != -1 ? savedID : currentID;
    }
    /* set initial value of 0 if there is an incorrect one in the cookie */
    if (currentID == -1) currentID = 0;

    _this.currentAudio.set(_this.list[currentID]);

    var cookieContentFloat = parseFloat(getCookie("radioVolume"));
    _this.volume.set(isNaN(cookieContentFloat) ? 0.3 : cookieContentFloat);
    cookieContentString = getCookie("radioMuted");
    _this.muted.set(cookieContentString == "true" ? true : false);
    cookieContentString = getCookie("radioPlay");
    _this.playing.set(cookieContentString == "false" ? false : true);
  }
})();
