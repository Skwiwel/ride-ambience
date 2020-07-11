var globalSettings = new (function () {
  this.settingsOpen = new EmittingVariable(false);
  this.videoControls = new EmittingVariable(false);
  this.fullscreen = new EmittingVariable(false);
  var _this = this;

  this.videoControls.addListener(function () {
    setCookie("videoControls", _this.videoControls.get());
  });

  this.fullscreen.addListener(function () {
    const doc = document.documentElement;
    if (_this.fullscreen.get() === true) {
      if (doc.requestFullscreen) {
        doc.requestFullscreen();
      } else if (doc.mozRequestFullScreen) {
        /* Firefox */
        doc.mozRequestFullScreen();
      } else if (doc.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        doc.webkitRequestFullscreen();
      } else if (doc.msRequestFullscreen) {
        /* IE/Edge */
        doc.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen();
      }
    }
  });

  // init
  {
    /* Enable video controls if they were enabled last time */
    if (getCookie("videoControls") == "true") this.videoControls.set(true);
    // If the cookie value is not set or is set to incorrect value
    else setCookie("videoControls", "false");
  }
})();
