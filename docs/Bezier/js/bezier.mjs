class Bezier {
  getPoints(count = 100, ...points) {
    const len = points.length;
    if (len < 2 || len > 4) {
      throw new Error("参数points的长度应该大于等于2小于5");
    }
    const fn =
      len === 2
        ? this.firstOrder
        : len === 3
        ? this.secondOrder
        : this.thirdOrder;
    const retPoints = [];
    for (let i = 0; i < count; i++) {
      retPoints.push(fn.call(null, i / count, ...points));
    }
    return retPoints;
  }

  firstOrder(t, p0, p1) {
    const { x: x0, y: y0 } = p0;
    const { x: x1, y: y1 } = p1;
    const x = (x1 - x0) * t;
    const y = (y1 - y0) * t;
    return { x, y };
  }

  secondOrder(t, p0, p1, p2) {
    const { x: x0, y: y0 } = p0;
    const { x: x1, y: y1 } = p1;
    const { x: x2, x: y2 } = p2;
    const x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2;
    const y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2;
    return { x, y };
  }

  thirdOrder(t, p0, p1, p2, p3) {
    const { x: x0, y: y0 } = p0;
    const { x: x1, y: y1 } = p1;
    const { x: x2, y: y2 } = p2;
    const { x: x3, y: y3 } = p3;
    let x =
      x0 * Math.pow(1 - t, 3) +
      3 * x1 * t * (1 - t) * (1 - t) +
      3 * x2 * t * t * (1 - t) +
      x3 * t * t * t;
    let y =
      y0 * (1 - t) * (1 - t) * (1 - t) +
      3 * y1 * t * (1 - t) * (1 - t) +
      3 * y2 * t * t * (1 - t) +
      y3 * t * t * t;
    return { x, y };
  }
}

export default new Bezier();
