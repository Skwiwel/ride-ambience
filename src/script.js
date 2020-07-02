linksFileURL =
  "https://raw.githubusercontent.com/Skwiwel/YT-Drive-Project/master/YouTube_Links.txt";

var JsonCookie = new Object();

function initJson() {
  var cookieContentString = getCookie("JsonCookie");
  if (cookieContentString != "") JsonCookie = JSON.parse(cookieContentString);
  if (JsonCookie.links == undefined) JsonCookie.links = {};

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
        if (JsonCookie.links[video_id] == undefined) {
          JsonCookie.links[video_id] = { start: 0, weight: 0 };
        }
      });
      setCookie("JsonCookie", JSON.stringify(JsonCookie));
    }
  };
  rawFile.send(null);
}

function saveJson() {
  setCookie("JsonCookie", JSON.stringify(JsonCookie));
}

function increaseVideoWeight(video_id) {
  if (JsonCookie.links[videoId] != undefined) {
    JsonCookie.links[video_id].start = 0;
    JsonCookie.links[video_id].weight += 1;
  } else {
    JsonCookie.links[video_id] = { start: 0, weight: 1 };
  }
  saveJson();
}

function updateVideoTime(video_id, time) {
  JsonCookie.links[video_id].start = time;
  if (JsonCookie.links[videoId].weight == undefined) {
    JsonCookie.links[video_id].weight = 0;
  }
  saveJson();
}

function getVideoStart(video_id) {
  if (JsonCookie.links[video_id] == undefined) {
    return 0;
  } else {
    return JsonCookie.links[video_id].start;
  }
}

function findNextVideo() {
  var lowestWeight = Number.MAX_VALUE;
  var videos = [];
  for (const video in JsonCookie.links) {
    var newWeight = JsonCookie.links[`${video}`].weight;
    if (newWeight < lowestWeight) {
      lowestWeight = newWeight;
      videos = [`${video}`];
    } else if (newWeight == lowestWeight) {
      videos.push(`${video}`);
    }
  }
  // If every weight > 0 then subtract the weights by one. Subject to possibly change in the future.
  if (lowestWeight > 0) {
    for (const video in JsonCookie.links) {
      JsonCookie.links[`${video}`].weight -= 1;
    }
  }
  // Return a random video from the choosen ones.
  if (videos.length == 0) return "";
  var i = Math.floor(Math.random() * videos.length);
  return videos[i];
}

function VideoControls() {
  this.enabled = getCookie("videoContols");
}

initJson();
