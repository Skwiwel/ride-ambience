const videoLinksFileURL =
  "https://raw.githubusercontent.com/Skwiwel/ride-ambience/master/video_presets.json";

var videoList = new (function () {
  this.links = {};
  const defaultVideoStartTime = 30;
  var presets = {};

  function VideoLink(
    title = "",
    startDefault = defaultVideoStartTime,
    start = defaultVideoStartTime,
    weight = 0,
    volumeMult = 1.0
  ) {
    this.title = title;
    this.startDefault = startDefault;
    this.start = start;
    this.weight = weight;
    this.volumeMult = volumeMult;
  }

  this.save = function () {
    setCookie("VideoList", JSON.stringify(this.links));
  };

  this.increaseVideoWeight = function (videoId) {
    if (videoId == "" || this.links[videoId] === undefined) return;

    if (this.links[videoId].startDefault === undefined) {
      this.links[videoId].start = defaultVideoStartTime;
    } else {
      this.links[videoId].start = this.links[videoId].startDefault;
    }
    this.links[videoId].weight += 1;
    if (this.links[videoId].weight > 2) this.links[videoId].weight = 2;

    this.save();
  };

  this.updateVideoTime = function (videoId, time) {
    this.links[videoId].start = time;
    if (this.links[videoId].weight == undefined) {
      this.links[videoId].weight = 0;
    }
    this.save();
  };

  this.getVideoStart = function (videoId) {
    if (this.links[videoId] == undefined) {
      return 0;
    } else {
      return this.links[videoId].start;
    }
  };

  this.findNextVideo = function () {
    var lowestWeight = Number.MAX_VALUE;
    var videos = [];
    for (const video in _this.links) {
      var newWeight = _this.links[`${video}`].weight;
      if (newWeight < lowestWeight) {
        lowestWeight = newWeight;
        videos = [`${video}`];
      } else if (newWeight == lowestWeight) {
        videos.push(`${video}`);
      }
    }
    // If every weight > 0 then subtract the weights by one.
    // Subject to possibly change in the future.
    if (lowestWeight > 0) {
      for (const video in _this.links) {
        _this.links[`${video}`].weight -= 1;
      }
    }
    // Return a random video from the choosen ones.
    if (videos.length == 0) return "";
    var i = Math.floor(Math.random() * videos.length);
    return videos[i];
  };

  this.add = function (id, startDefault = defaultVideoStartTime) {
    id = String(id);
    if (id.length < 11) return "Error: Incorrect id format.";
    id = GetYouTubeID(id);
    if (_this.links[id] == undefined) {
      _this.links[id] = new VideoLink();
      this.save();
      return "Added!";
    } else {
      return "Error: This video is already on the list.";
    }
  };

  this.delete = function (id) {
    id = GetYouTubeID(id);
    if (_this.links[id] == undefined) {
      return false;
    }
    delete _this.links[id];
    this.save();
    return true;
  };

  this.setTitle = function (id, title) {
    if (title != "") _this.links[id].title = title;
    this.save();
  };

  // init
  {
    var cookieContentString = getCookie("VideoList");
    var _this = this;
    if (cookieContentString != "") {
      _this.links = JSON.parse(cookieContentString);
    }

    /* Load the preset links from site if presetFetch is enabled */
    if (
      globalSettings.preset.get().localeCompare("Custom") != 0 &&
      globalSettings.presetFetch.get()
    ) {
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", videoLinksFileURL, false);
      rawFile.onload = function () {
        if (
          rawFile.readyState === 4 &&
          (rawFile.status === 200 || rawFile.status == 0)
        ) {
          var rawText = rawFile.responseText;
          presets = JSON.parse(rawText);
          var links = presets[globalSettings.preset.get()];
          for (const video in links) {
            if (_this.links[`${video}`] === undefined)
              _this.links[`${video}`] = links[`${video}`];
          }
          setCookie("VideoList", JSON.stringify(_this.links));
        }
      };
      rawFile.send(null);
    }

    // error checking
    for (const video in _this.links) {
      if (_this.links[`${video}`].title === undefined) {
        _this.links[`${video}`].title = "";
      }
      if (_this.links[`${video}`].weight === undefined) {
        _this.links[`${video}`].weight = 0;
      }
      if (_this.links[`${video}`].startDefault === undefined) {
        _this.links[`${video}`].startDefault = defaultVideoStartTime;
      }
      if (_this.links[`${video}`].start === undefined) {
        _this.links[`${video}`].start = _this.links[`${video}`].startDefault;
      }
      if (_this.links[`${video}`].volumeMult === undefined) {
        _this.links[`${video}`].volumeMult = 1.0;
      }
    }
  }
})();
