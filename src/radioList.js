const radioListFileURL =
  "https://raw.githubusercontent.com/Skwiwel/ride-ambience/feature-presets/radio_presets.json";

var radioList = new (function () {
  var _this = this;
  this.links = [];
  var currentID = -1;

  function RadioLink(url, name = "") {
    this.url = url;
    this.name = name;
  }
  /* Contains a RadioLink or an empty object if there are none on the list */
  this.currentAudio = new EmittingVariable({});

  /* Save the current station on change */
  this.currentAudio.addListener(function (radio) {
    setCookie("radioListLastPlayed", radio.url);
  });

  this.getURL = function () {
    return _this.currentAudio.get().url;
  };
  this.getName = function () {
    return _this.currentAudio.get().name;
  };

  this.next = function () {
    if (_this.links.length == 0) return;
    ++currentID;
    if (currentID >= _this.links.length) currentID = 0;
    _this.currentAudio.set(_this.links[currentID]);
  };
  this.prev = function () {
    if (_this.links.length == 0) return;
    --currentID;
    if (currentID < 0) currentID = _this.links.length - 1;
    _this.currentAudio.set(_this.links[currentID]);
  };

  this.playByURL = function (url) {
    var id = _this.links.findIndex((e) => e.url == url);
    if (id === -1) return;
    currentID = id;
    _this.currentAudio.set(_this.links[currentID]);
  };

  this.deleteByURL = function (url) {
    var id = _this.links.findIndex((e) => e.url == url);
    if (id === -1) return false;
    _this.links.splice(id, 1);
    if (_this.links.length == 0) {
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
    var id = _this.links.findIndex((e) => e.url == url);
    if (id !== -1) return "Error: This url is already on the list.";
    _this.links.push(new RadioLink(url));
    // Check if the array was empty previously. Trigger play if that's the case.
    if (_this.links.length == 1) {
      currentID = 0;
      _this.currentAudio.set(_this.links[currentID]);
    }
    _this.save();
    return "Added!";
  };

  this.changeNameByURL = function (url, name) {
    var id = _this.links.findIndex((e) => e.url == url);
    if (id === -1) return;
    _this.links[id].name = name;
    _this.save();
    // Update current audio to reflect the name change
    if (id == currentID) _this.currentAudio.set(_this.links[currentID]);
  };

  this.save = function () {
    setCookie("RadioList", JSON.stringify(this.links));
  };

  // Init
  {
    var cookieContentString = getCookie("RadioList");
    if (cookieContentString != "") {
      _this.links = JSON.parse(cookieContentString);
    }
    /* Load the preset links from site if presetFetch is enabled */
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
          presets = JSON.parse(rawText);
          var links = presets[globalSettings.preset.get()].list;
          links.forEach((link) => {
            if (link.url === undefined || link.url == "") return;
            // if the id is new to the cookie add it
            if (_this.links.some((e) => e.url == link.url) == false) {
              _this.links.push(link);
            }
          });
          _this.links.sort((e1, e2) => e1.name.localeCompare(e2.name));
          _this.save();
          // Set default radio
          let defaultURL = presets[globalSettings.preset.get()].default;
          currentID = _this.links.findIndex((e) => e.url == defaultURL);
        }
      };
      rawFile.send(null);
    }

    var cookieContentString = getCookie("radioListLastPlayed");
    if (cookieContentString != "") {
      let savedID = _this.links.findIndex((e) => e.url == cookieContentString);
      currentID = savedID != -1 ? savedID : currentID;
    }
    /* set initial value of 0 if there is an incorrect one in the cookie */
    if (currentID == -1) currentID = 0;

    _this.currentAudio.set(_this.links[currentID]);
  }
})();
