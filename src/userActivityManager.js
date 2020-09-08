var UserActivityManager = new (function () {
  const _this = this;

  _this.cursorActive = new EmittingVariable(true);

  const inactivityMsTimeout = 5000;
  var mouseTimer = null;

  function disappearCursor() {
    _this.cursorActive.set(false);
  }

  function updateMouseActivity() {
    if (mouseTimer != null) {
      window.clearTimeout(mouseTimer);
    }
    if (_this.cursorActive.get() == false) {
      _this.cursorActive.set(true);
    }
    mouseTimer = window.setTimeout(disappearCursor, inactivityMsTimeout);
  }
  document.onmousemove = updateMouseActivity;

  _this.cursorActive.addListener(function (active) {
    document.body.style.cursor = active ? "default" : "none";
  });
})();
