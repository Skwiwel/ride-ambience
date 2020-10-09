import {EmittingVariable} from './EmittingVariable.js';
import {setCookie, getCookie} from './cookieOperations.js';
import {globalSettings} from './globalSettings.js';
import {GetYouTubeID} from './GetYouTubeID.js';

const videoListFileURL =
  "../public/video_presets.json";

export var videoModule = new (function () {
  var _this = this;
  function VideoLink(
    id,
    title = "",
    startDefault = defaultVideoStartTime,
    start = defaultVideoStartTime,
    weight = 0,
    volumeMult = 1.0
  ) {
    this.id = id;
    this.title = title;
    this.startDefault = startDefault;
    this.start = start;
    this.weight = weight;
    this.volumeMult = volumeMult;
  }

  this.list = {};
  const defaultVideoStartTime = 30;
  var presets = {};

  this.playing = new EmittingVariable(true);
  /* Contains a RadioLink or an empty object if there are none on the list */
  this.currentVideo = new EmittingVariable({});
  this.volume = new EmittingVariable(1.0);
  this.muted = new EmittingVariable(false);
  /* video time in seconds */
  this.time = new EmittingVariable({ current: 0, end: 0 });

  this.volume.addListener(function (volume) {
    setCookie("videoVolume", volume);
  });
  this.muted.addListener(function (muted) {
    setCookie("videoMuted", muted);
  });
  // Update time in video list on current video time update
  this.time.addListener(function (time) {
    _this.list[_this.currentVideo.get().id].start = time.current;
  });
  /*  If the user is leaving the site at a certain treshold before video finish
   *  the video should be considered finished.
   *  This way it won't be loaded for just a few seconds in the future */
  window.addEventListener("beforeunload", function () {
    const timeToEndCutoff = 60;
    let time = _this.time.get();
    if (
      time === undefined ||
      time.current === undefined ||
      time.end === undefined
    )
      return;
    if (time.end - time.current < timeToEndCutoff) {
      _this.increaseVideoWeight(_this.currentVideo.get().id);
      _this.save();
    }
  });

  this.save = function () {
    setCookie("VideoList", JSON.stringify(this.list));
  };

  this.increaseVideoWeight = function (videoId) {
    if (videoId == "" || this.list[videoId] === undefined) return;

    if (this.list[videoId].startDefault === undefined) {
      this.list[videoId].start = defaultVideoStartTime;
    } else {
      this.list[videoId].start = this.list[videoId].startDefault;
    }
    this.list[videoId].weight += 1;
    if (this.list[videoId].weight > 2) this.list[videoId].weight = 2;

    this.save();
  };

  this.changeRelativeVolume = function (id, relativeVolume) {
    if (_this.list[id] === undefined) return;
    if (relativeVolume < 0 || relativeVolume > 1.0) return;
    _this.list[id].relativeVolume = relativeVolume;
    if (id == _this.currentVideo.get().id) {
      _this.currentVideo.set(_this.currentVideo.get());
      _this.volume.set(_this.volume.get())
    }
    _this.save()
  };

  this.getVideoStart = function (videoId) {
    if (this.list[videoId] == undefined) {
      return 0;
    } else {
      return this.list[videoId].start;
    }
  };

  this.findNextVideo = function () {
    var lowestWeight = Number.MAX_VALUE;
    var videos = [];
    for (const video in _this.list) {
      var newWeight = _this.list[`${video}`].weight;
      if (newWeight < lowestWeight) {
        lowestWeight = newWeight;
        videos = [_this.list[`${video}`]];
      } else if (newWeight == lowestWeight) {
        videos.push(_this.list[`${video}`]);
      }
    }
    // If every weight > 0 then subtract the weights by one.
    // Subject to possibly change in the future.
    if (lowestWeight > 0) {
      for (const video in _this.list) {
        _this.list[`${video}`].weight -= 1;
      }
    }
    // Choose a random video from the filtered list.
    if (videos.length == 0) return "";
    var i = Math.floor(Math.random() * videos.length);

    _this.currentVideo.set(videos[i]);
  };

  this.add = function (id, startDefault = defaultVideoStartTime) {
    id = String(id);
    if (id.length < 11) return "Error: Incorrect id format.";
    id = GetYouTubeID(id);
    if (_this.list[id] == undefined) {
      _this.list[id] = new VideoLink(id);
      this.save();
      return "Added!";
    } else {
      return "Error: This video is already on the list.";
    }
  };

  this.delete = function (id) {
    id = GetYouTubeID(id);
    if (_this.list[id] == undefined) {
      return false;
    }
    delete _this.list[id];
    this.save();
    if (_this.currentVideo.get().id == id) {
      _this.findNextVideo();
    }
    return true;
  };

  this.setTitle = function (id, title) {
    if (title == "") return;
    _this.list[id].title = title;
    this.save();
    if (_this.currentVideo.get().id == id) {
      _this.currentVideo.set(_this.list[id]);
    }
  };

  // init
  {
    var cookieContentString = getCookie("VideoList");
    if (cookieContentString != "") {
      _this.list = JSON.parse(cookieContentString);
    }

    /* Load the preset list from site if presetFetch is enabled */
    if (
      globalSettings.preset.get().localeCompare("Custom") != 0 &&
      globalSettings.presetFetch.get()
    ) {
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", videoListFileURL, false);
      rawFile.onload = function () {
        if (
          rawFile.readyState === 4 &&
          (rawFile.status === 200 || rawFile.status == 0)
        ) {
          var rawText = rawFile.responseText;
          presets = JSON.parse(rawText);
          var list = presets[globalSettings.preset.get()];
          for (const video in list) {
            if (_this.list[`${video}`] === undefined) {
              _this.list[`${video}`] = list[`${video}`];
              _this.list[`${video}`].id = video;
            }
            for (const property in list[`${video}`]) {
              if (_this.list[`${video}`][`${property}`] === undefined) {
                _this.list[`${video}`][`${property}`] = list[`${video}`][`${property}`];
              }
            }
          }
          setCookie("VideoList", JSON.stringify(_this.list));
        }
      };
      rawFile.send(null);
    }

    // error checking
    for (const video in _this.list) {
      if (_this.list[`${video}`].id === undefined) {
        _this.list[`${video}`].id = video;
      }
      if (_this.list[`${video}`].title === undefined) {
        _this.list[`${video}`].title = "";
      }
      if (_this.list[`${video}`].weight === undefined) {
        _this.list[`${video}`].weight = 0;
      }
      if (_this.list[`${video}`].startDefault === undefined) {
        _this.list[`${video}`].startDefault = defaultVideoStartTime;
      }
      if (
        _this.list[`${video}`].start === undefined ||
        _this.list[`${video}`].start < _this.list[`${video}`].startDefault
      ) {
        _this.list[`${video}`].start = _this.list[`${video}`].startDefault;
      }
      if (_this.list[`${video}`].relativeVolume === undefined) {
        _this.list[`${video}`].relativeVolume = 1.0;
      }
    }
    _this.save();

    var cookieContentFloat = parseFloat(getCookie("videoVolume"));
    _this.volume.set(
      isNaN(cookieContentFloat) ? 0.75 : cookieContentFloat % 1.0
    );
    cookieContentString = getCookie("videoMuted");
    _this.muted.set(cookieContentString == "true" ? true : false);

    _this.findNextVideo();
  }
})();
