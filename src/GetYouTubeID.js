export function GetYouTubeID(url) {
  var id = "";
  url = url
    .replace(/(>|<)/gi, "")
    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (url[2] !== undefined) {
    id = url[2].split(/[^0-9a-z_\-]/i)[0];
  } else {
    id = url[0];
  }
  return id;
}
