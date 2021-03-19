import {videoModule} from './videoModule.js';
import {radioModule} from './radioModule.js';

var startButton = new (function () {
    var _this = this;
    var button = document.getElementById("initial-start-button");

    function play() {
        videoModule.playing.set(true);
        radioModule.playing.set(true);
        hide();
    }
    button.onclick = play;

    function hide() {
        button.style.visibility = 'hidden';
    }

    videoModule.playing.addListener(checkAndHide);
    radioModule.playing.addListener(checkAndHide);
    function checkAndHide() {
        var shouldHide = videoModule.playing.get() && radioModule.playing.get();
        if (shouldHide) {
            hide();
            videoModule.playing.removeListener(checkAndHide);
            radioModule.playing.removeListener(checkAndHide);
        }
    }
    // init
    {

    }
})();
