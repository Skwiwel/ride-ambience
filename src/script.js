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
  if (videos.length == 0) return "";
  var i = Math.floor(Math.random() * videos.length);
  return videos[i];
}

initJson();

var videoId = "";

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    videoId: videoId,
    playerVars: {
      fs: 0,
      modestbranding: 1,
      start: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
  videoId = findNextVideo();
  event.target.cueVideoById(videoId, getVideoStart(videoId));
  event.target.playVideo();
}

// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    increaseVideoWeight(videoId);
    videoId = findNextVideo();
    player.loadVideoById({ videoId: videoId });
  }
}
