/**
 * Class to represent and add functionality to a generic checkbox button
 * @param {String} id - html id of the button element
 * @param {EmittingVariable} setting - an EmittingVariable object
 */
function CheckboxButton(id, setting) {
  const button = document.getElementById(id);
  button.onclick = function () {
    setting.set(!setting.get());
  };
  this.update = function () {
    button.dataset.state = setting.get();
  };
  setting.addListener(this.update);
  // init
  {
    this.update();
  }
}
