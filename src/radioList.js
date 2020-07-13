const radioListFileURL =
  "https://raw.githubusercontent.com/Skwiwel/ride-ambience/master/Radio_Links";

var radioList = new (function () {
  var _this = this;
  this.links = [];
  var current = -1;
  this.getURL = function () {
    return _this.links[current].url;
  };
  this.getName = function () {
    return _this.links[current].name;
  };
  this.next = function () {
    ++current;
    if (current >= _this.links.length) current = 0;
  };
  this.prev = function () {
    --current;
    if (current < 0) current = _this.links.length - 1;
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
    if (globalSettings.presetFetch.get()) {
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", radioListFileURL, false);
      rawFile.onload = function () {
        if (
          rawFile.readyState === 4 &&
          (rawFile.status === 200 || rawFile.status == 0)
        ) {
          var links = rawFile.responseText.split("\n");
          links.forEach((link) => {
            if (link == "") return;
            var split = link.split(" ");
            var url = split[0];
            split.shift(); // delete the url part
            var name = split.join(" ");
            // if the id is new to the cookie add it
            if (_this.links.some((e) => e.url == url) == false) {
              _this.links.push({ url: url, name: name });
            }
          });
          _this.links.sort((e1, e2) => e1.name.localeCompare(e2.name));
          _this.save();
        }
      };
      rawFile.send(null);
    }

    var cookieContentString = getCookie("radioListLastPlayed");
    if (cookieContentString != "") {
      current = _this.links.findIndex((e) => e.name == cookieContentString);
    }
    /* set initial value of 0 if there is an incorrect one in the cookie */
    if (current == -1) current = 0;

    /* save the current station before leaving the site */
    window.addEventListener("beforeunload", function () {
      setCookie("radioListLastPlayed", _this.links[current].name);
    });
  }
})();
