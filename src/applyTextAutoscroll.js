export function applyTextAutoscroll(elem) {
  const tansitionTimePerPixel = 0.01;
  const textBoxes = elem.querySelectorAll(".text-autoscroll");
  textBoxes.forEach((textBox) => {
    textBox.addEventListener("mouseenter", () => {
      let textWidth = textBox.lastChild.clientWidth;
      let boxWidth = parseFloat(getComputedStyle(textBox).width);
      let translateVal = Math.min(boxWidth - textWidth, 0);
      let translateTime = -tansitionTimePerPixel * translateVal + "s";
      textBox.lastChild.style.transitionDuration = translateTime;
      textBox.lastChild.style.transform = "translateX(" + translateVal + "px)";
    });
    textBox.addEventListener("mouseleave", () => {
      textBox.lastChild.style.transitionDuration = "0.2s";
      textBox.lastChild.style.transform = "translateX(0)";
    });
  });
}
