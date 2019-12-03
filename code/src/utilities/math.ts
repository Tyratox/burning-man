//https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
//https://gamedev.stackexchange.com/questions/44483/how-do-i-calculate-distance-between-a-point-and-an-axis-aligned-rectangle
type Vector = { x: number; y: number };

const sqr = (x: number) => x * x;
export const dist2 = (v: Vector, w: Vector) => sqr(v.x - w.x) + sqr(v.y - w.y);

const distanceToLineSegmentSquared = (p: Vector, v: Vector, w: Vector) => {
  let l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
};
export const distanceToLineSegment = (p: Vector, v: Vector, w: Vector) =>
  Math.sqrt(distanceToLineSegmentSquared(p, v, w));

export const isLeftOfLine = (p: Vector, a: Vector, b: Vector) =>
  (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) > 0;

export const pointRectNormal = (
  // returns the vector pointing from the closest point on the rect to the position p
  p: Vector,
  r: Vector,
  rwidth: number,
  rheight: number
) => {
  const center = new Phaser.Math.Vector2(r.x + rwidth / 2, r.y + rheight / 2);
  const d = new Phaser.Math.Vector2(0, 0);
  d.x = Math.max(Math.abs(center.x - p.x) - rwidth / 2, 0);
  d.y = Math.max(Math.abs(center.y - p.y) - rheight / 2, 0);

  if (p.x < center.x) {
    d.x *= -1;
  }
  if (p.y < center.y) {
    d.y *= -1;
  }
  return d;
};
