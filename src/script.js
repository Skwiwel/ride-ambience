linksFileURL =
  "https://raw.githubusercontent.com/Skwiwel/YT-Drive-Project/master/YouTube_Links.txt";

var videoList = {
  links: new Object(),
  init: function () {
    var cookieContentString = getCookie("VideoList");
    var _this = this;
    if (cookieContentString != "") {
      _this.links = JSON.parse(cookieContentString);
    }

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", linksFileURL, false);
    rawFile.onload = function () {
      if (
        rawFile.readyState === 4 &&
        (rawFile.status === 200 || rawFile.status == 0)
      ) {
        var links = rawFile.responseText.split("\n");
        links.forEach((link) => {
          if (link == "") return;
          // get the id from yt URL
          var video_id = link.split("v=")[1];
          var ampersandPosition = video_id.indexOf("&");
          if (ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
          }
          // if the id is new to the cookie add it
          if (_this.links[video_id] == undefined) {
            _this.links[video_id] = { start: 0, weight: 0 };
          }
        });
        setCookie("VideoList", JSON.stringify(_this.links));
      }
    };
    rawFile.send(null);
  },
  save: function () {
    setCookie("VideoList", JSON.stringify(this.links));
  },
  increaseVideoWeight: function (video_id) {
    if (this.links[videoId] != undefined) {
      this.links[video_id].start = 0;
      this.links[video_id].weight += 1;
    } else {
      this.links[video_id] = { start: 0, weight: 1 };
    }
    this.save();
  },
  updateVideoTime: function (video_id, time) {
    this.links[video_id].start = time;
    if (this.links[videoId].weight == undefined) {
      this.links[video_id].weight = 0;
    }
    this.save();
  },
  getVideoStart: function (video_id) {
    if (this.links[video_id] == undefined) {
      return 0;
    } else {
      return this.links[video_id].start;
    }
  },
};

function findNextVideo() {
  var lowestWeight = Number.MAX_VALUE;
  var videos = [];
  for (const video in videoList.links) {
    var newWeight = videoList.links[`${video}`].weight;
    if (newWeight < lowestWeight) {
      lowestWeight = newWeight;
      videos = [`${video}`];
    } else if (newWeight == lowestWeight) {
      videos.push(`${video}`);
    }
  }
  // If every weight > 0 then subtract the weights by one. Subject to possibly change in the future.
  if (lowestWeight > 0) {
    for (const video in videoList.links) {
      VideoList.links[`${video}`].weight -= 1;
    }
  }
  // Return a random video from the choosen ones.
  if (videos.length == 0) return "";
  var i = Math.floor(Math.random() * videos.length);
  return videos[i];
}

var videoControls = {
  enabled: false,
  containerDiv: document.getElementById("video_controls_container"),
  init: function () {
    var temp = getCookie("videoContolsEnabled");
    if (temp == "true") this.enabled = true;
    else setCookie("videoContolsEnabled", "false"); // if the cookie value is not set or is set to incorrect value
    this.updateVisibility();
  },
  toggleEnabled: function () {
    this.enabled = !this.enabled;
    this.updateVisibility();
    setCookie("videoContolsEnable", this.enabled);
  },
  updateVisibility: function () {
    this.containerDiv.style.visibility = this.enabled ? "visible" : "hidden";
  },
};

videoList.init();
videoControls.init();
