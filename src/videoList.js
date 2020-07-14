const videoLinksFileURL =
  "https://raw.githubusercontent.com/Skwiwel/ride-ambience/master/YouTube_Links";

var videoList = new (function () {
  this.links = {};
  const defaultVideoStartTime = 30;

  function VideoLink(
    startDefault = defaultVideoStartTime,
    start = defaultVideoStartTime,
    weight = 0
  ) {
    this.startDefault = startDefault;
    this.start = start;
    this.weight = weight;
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
      _this.links[id] = new VideoLink(startDefault);
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

  // init
  {
    var cookieContentString = getCookie("VideoList");
    var _this = this;
    if (cookieContentString != "") {
      _this.links = JSON.parse(cookieContentString);
    }

    /* Load the preset links from site if presetFetch is enabled */
    if (globalSettings.presetFetch.get()) {
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", videoLinksFileURL, false);
      rawFile.onload = function () {
        if (
          rawFile.readyState === 4 &&
          (rawFile.status === 200 || rawFile.status == 0)
        ) {
          var links = rawFile.responseText.split("\n");
          links.forEach((link) => {
            if (link == "") return;
            // get the id from yt URL
            videoId = GetYouTubeID(link);
            // if the id is new to the cookie add it
            if (_this.links[videoId] == undefined) {
              _this.links[videoId] = new VideoLink();
            }
          });
          setCookie("VideoList", JSON.stringify(_this.links));
        }
      };
      rawFile.send(null);
    }

    // error checking
    for (const video in _this.links) {
      if (_this.links[`${video}`].weight === undefined) {
        _this.links[`${video}`].weight = 0;
      }
      if (_this.links[`${video}`].startDefault === undefined) {
        _this.links[`${video}`].startDefault = defaultVideoStartTime;
      }
      if (_this.links[`${video}`].start === undefined) {
        _this.links[`${video}`].start = _this.links[`${video}`].startDefault;
      }
    }
  }
})();
