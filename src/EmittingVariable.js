export function EmittingVariable(val = undefined) {
  var value = val;
  var listeners = [];
  this.set = function (val) {
    value = val;
    for (const i in listeners) listeners[i](value);
  };
  this.get = function () {
    return value;
  };
  this.addListener = function (fun) {
    if (fun && typeof fun == "function") listeners.push(fun);
  };
  this.removeListener = function (fun) {
    const index = listeners.indexOf(fun);
    if (index > -1) listeners.splice(index, 1);
  };
}
