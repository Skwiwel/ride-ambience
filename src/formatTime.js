function formatTime(time) {
  if (time == undefined) return "-";
  time = Math.round(time);

  var hours = Math.floor(time / (60 * 60));
  time = time - hours * 60 * 60;
  var minutes = Math.floor(time / 60);
  var seconds = time - minutes * 60;

  minutes = hours > 0 && minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  var returnString = minutes + ":" + seconds;
  if (hours > 0) returnString = hours + ":" + returnString;
  return returnString;
}
