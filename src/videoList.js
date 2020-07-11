const videoLinksFileURL =
  "https://raw.githubusercontent.com/Skwiwel/YT-Drive-Project/master/YouTube_Links";

var videoList = new (function () {
  this.links = {};
  const defaultVideoStartTime = 30;

  this.save = function () {
    setCookie("VideoList", JSON.stringify(this.links));
  };
  this.increaseVideoWeight = function (videoId) {
    if (videoId == "") return;
    if (this.links[videoId] != undefined) {
      this.links[videoId].start = defaultVideoStartTime;
      this.links[videoId].weight += 1;
    } else {
      this.links[videoId] = { start: defaultVideoStartTime, weight: 1 };
    }
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
  // init
  {
    var cookieContentString = getCookie("VideoList");
    var _this = this;
    if (cookieContentString != "") {
      _this.links = JSON.parse(cookieContentString);
    }

    if (globalSettings.presetFetch.get()) {
      console.log("Fetching preset video");
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
            var videoId = link.split("v=")[1];
            var ampersandPosition = videoId.indexOf("&");
            if (ampersandPosition != -1) {
              videoId = videoId.substring(0, ampersandPosition);
            }
            // if the id is new to the cookie add it
            if (_this.links[videoId] == undefined) {
              _this.links[videoId] = {
                start: defaultVideoStartTime,
                weight: 0,
              };
            }
          });
          setCookie("VideoList", JSON.stringify(_this.links));
        }
      };
      rawFile.send(null);
    }
  }
})();
