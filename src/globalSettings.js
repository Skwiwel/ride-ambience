var globalSettings = new (function () {
  this.videoControls = new EmittingVariable(false);
  var _this = this;

  this.videoControls.addListener(function () {
    setCookie("videoControls", _this.videoControls.get());
  });
  // init
  {
    /* Enable video controls if they were enabled last time */
    if (getCookie("videoControls") == "true") this.videoControls.set(true);
    // If the cookie value is not set or is set to incorrect value
    else setCookie("videoControls", "false");
  }
})();
