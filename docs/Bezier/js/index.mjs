import bezier from "./bezier.mjs";

const firstOrderEl = document.querySelector(".firstOrder");
const secondOrderEl = document.querySelector(".secondOrder");
const thirdOrderEl = document.querySelector(".thirdOrder");

function firstOrder() {
  const points = bezier.getPoints(100, { x: 0, y: 0 }, { x: 500, y: 500 });
  drawLine(firstOrderEl, points);
}

function secondOrder() {
  const point1 = getParamPoints(document.querySelector(".controller-2"))[0];
  const points = bezier.getPoints(100, { x: 0, y: 0 }, point1, {
    x: 500,
    y: 500
  });
  drawLine(secondOrderEl, points);
  drawDots(secondOrderEl, [point1]);
}

function thirdOrder() {
  const point = getParamPoints(document.querySelector(".controller-3"));
  const points = bezier.getPoints(100, { x: 0, y: 0 }, ...point, {
    x: 500,
    y: 500
  });
  drawLine(thirdOrderEl, points);
  drawDots(thirdOrderEl, point);
}

function drawLine(el, points) {
  el.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const height = el.clientHeight;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const span = document.createElement("span");
    span.classList = "dot";
    span.style.top = `${height - point.y}px`;
    span.style.left = point.x + "px";
    fragment.appendChild(span);
  }
  el.appendChild(fragment);
}

function drawDots(el, points) {
  const height = el.clientHeight;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const span = document.createElement("span");
    span.classList = "bigDot";
    span.style.top = `${height - point.y}px`;
    span.style.left = point.x + "px";
    span.title = "点" + (i + 1);
    el.appendChild(span);
  }
}

function getParamPoints(el) {
  const pointContainers = el.querySelectorAll(".point");
  return Array.from(pointContainers).map(getPoint);
}

function getPoint(pointContiner) {
  const ps = pointContiner.querySelectorAll(".range");
  return {
    x: +ps[0].value,
    y: +ps[1].value
  };
}

function rangeValue() {
  const ranges = document.querySelectorAll(".range");
  for (let i = 0; i < ranges.length; i++) {
    ranges[i].addEventListener("change", function(ev) {
      const el = this;
      el.nextElementSibling.innerText = el.value;
    });
  }

  document
    .querySelector(".controller-2")
    .addEventListener("change", function(ev) {
      secondOrder();
    });

  document
    .querySelector(".controller-3")
    .addEventListener("change", function(ev) {
      thirdOrder();
    });
}

function init() {
  rangeValue();
  firstOrder();
  secondOrder();
  thirdOrder();
}

init();
