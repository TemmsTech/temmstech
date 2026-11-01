/**
 * Pure maths for the Capabilities photo cube. No DOM in here.
 *
 * Coordinates follow CSS: x to the right, y DOWN, z toward the viewer. A cubie
 * sits at an integer position (-1, 0 or 1 on each axis). Its stickers are
 * fixed to the cubie, so twisting a layer carries the pictures with it.
 */

export type Vec = readonly [number, number, number];
/** Row-major 3x3. */
export type Mat3 = readonly number[];
/** Row-major 4x4. */
export type Mat4 = readonly number[];

export type Cubie = {
  id: number;
  /** Where the cubie started: decides which photo tile its stickers show. */
  home: Vec;
  pos: Vec;
  /** Accumulated orientation (cube space). Identity when solved. */
  rot: Mat3;
};

export type Move = { axis: 0 | 1 | 2; layer: -1 | 0 | 1; dir: 1 | -1 };

/**
 * The six photo faces: outward normal, and the cube-space direction the
 * face element's own x (right) and y (down) point, so a photo can be cut
 * into the right 3x3 tiles. Index order is used everywhere.
 */
export const FACES: readonly { normal: Vec; right: Vec; down: Vec }[] = [
  { normal: [0, 0, 1], right: [1, 0, 0], down: [0, 1, 0] },
  { normal: [0, 0, -1], right: [-1, 0, 0], down: [0, 1, 0] },
  { normal: [1, 0, 0], right: [0, 0, -1], down: [0, 1, 0] },
  { normal: [-1, 0, 0], right: [0, 0, 1], down: [0, 1, 0] },
  { normal: [0, -1, 0], right: [1, 0, 0], down: [0, 0, 1] },
  { normal: [0, 1, 0], right: [1, 0, 0], down: [0, 0, -1] },
];

/** CSS transform that places each face element on its side of a cubie. */
export const FACE_TRANSFORMS: readonly string[] = [
  "translateZ(calc(var(--s) / 2))",
  "rotateY(180deg) translateZ(calc(var(--s) / 2))",
  "rotateY(90deg) translateZ(calc(var(--s) / 2))",
  "rotateY(-90deg) translateZ(calc(var(--s) / 2))",
  "rotateX(90deg) translateZ(calc(var(--s) / 2))",
  "rotateX(-90deg) translateZ(calc(var(--s) / 2))",
];

export const IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export function mulMat3(a: Mat3, b: Mat3): number[] {
  const out = new Array<number>(9).fill(0);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      for (let k = 0; k < 3; k++) out[r * 3 + c] += a[r * 3 + k] * b[k * 3 + c];
  return out;
}

export function mulVec(m: Mat3, v: Vec): Vec {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/** Rotation by `angle` radians about an axis (right-hand rule on the numbers). */
export function axisRotation(axis: 0 | 1 | 2, angle: number): number[] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  if (axis === 0) return [1, 0, 0, 0, c, -s, 0, s, c];
  if (axis === 1) return [c, 0, s, 0, 1, 0, -s, 0, c];
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

const roundMat = (m: Mat3) => m.map((v) => Math.round(v) + 0);
const roundVec = (v: Vec): Vec => [
  Math.round(v[0]) + 0,
  Math.round(v[1]) + 0,
  Math.round(v[2]) + 0,
];

export function createCubies(): Cubie[] {
  const cubies: Cubie[] = [];
  let id = 0;
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        // The hidden core never shows, so it is not a cubie.
        if (x === 0 && y === 0 && z === 0) continue;
        cubies.push({ id: id++, home: [x, y, z], pos: [x, y, z], rot: IDENTITY });
      }
  return cubies;
}

export function applyMove(cubies: readonly Cubie[], move: Move): Cubie[] {
  const q = roundMat(axisRotation(move.axis, (move.dir * Math.PI) / 2));
  return cubies.map((cubie) =>
    cubie.pos[move.axis] === move.layer
      ? {
          ...cubie,
          pos: roundVec(mulVec(q, cubie.pos)),
          rot: roundMat(mulMat3(q, cubie.rot)),
        }
      : cubie,
  );
}

export function isSolved(cubies: readonly Cubie[]) {
  return cubies.every(
    (cubie) =>
      cubie.pos.every((v, i) => v === cubie.home[i]) &&
      cubie.rot.every((v, i) => v === IDENTITY[i]),
  );
}

export function randomMoves(count: number): Move[] {
  const moves: Move[] = [];
  let last = -1;
  while (moves.length < count) {
    const axis = Math.floor(Math.random() * 3) as 0 | 1 | 2;
    // Do not twist the same axis twice running: it would just merge or undo.
    if (axis === last) continue;
    last = axis;
    moves.push({
      axis,
      layer: (Math.floor(Math.random() * 3) - 1) as -1 | 0 | 1,
      dir: Math.random() < 0.5 ? 1 : -1,
    });
  }
  return moves;
}

/** Where one face of a cubie shows a photo: face index, tile column and row. */
export function stickerOf(home: Vec, faceIndex: number) {
  const face = FACES[faceIndex];
  // A sticker only exists on the outside of the cube.
  if (dot(home, face.normal) !== 1) return null;
  return {
    col: dot(home, face.right) + 1,
    row: dot(home, face.down) + 1,
  };
}

/** The view the whole cube is shown in: CSS `rotateX(rx) rotateY(ry)`. */
export function viewMatrix(rxDeg: number, ryDeg: number): number[] {
  const rx = axisRotation(0, (rxDeg * Math.PI) / 180);
  const ry = axisRotation(1, (ryDeg * Math.PI) / 180);
  return mulMat3(rx, ry);
}

/**
 * The matrix for one cubie: layer animation, then position, then its own
 * orientation, as a CSS matrix3d() string (column-major).
 */
export function cubieTransform(
  cubie: Cubie,
  size: number,
  spread: number,
  turn?: { axis: 0 | 1 | 2; layer: number; angle: number },
  tumble?: Mat3,
): string {
  const [x, y, z] = cubie.pos;
  const r = cubie.rot;
  // Orientation first (about the cubie's own centre), tumble when scattered.
  let own: Mat3 = r;
  if (tumble) own = mulMat3(tumble, r);
  let m: number[] = [
    own[0], own[1], own[2], x * size * spread,
    own[3], own[4], own[5], y * size * spread,
    own[6], own[7], own[8], z * size * spread,
    0, 0, 0, 1,
  ];
  if (turn && cubie.pos[turn.axis] === turn.layer) {
    const q = axisRotation(turn.axis, turn.angle);
    const q4 = [
      q[0], q[1], q[2], 0,
      q[3], q[4], q[5], 0,
      q[6], q[7], q[8], 0,
      0, 0, 0, 1,
    ];
    m = mul4(q4, m);
  }
  const col: number[] = [];
  for (let c = 0; c < 4; c++) for (let rr = 0; rr < 4; rr++) col.push(m[rr * 4 + c]);
  return `matrix3d(${col.map((v) => +v.toFixed(5)).join(",")})`;
}

function mul4(a: Mat4, b: Mat4): number[] {
  const out = new Array<number>(16).fill(0);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      for (let k = 0; k < 4; k++) out[r * 4 + c] += a[r * 4 + k] * b[k * 4 + c];
  return out;
}

/**
 * A finger dragged across a sticker: which layer should twist, and which way?
 * `normal` is the sticker's outward direction in the cubie's own frame, and
 * `drag` is the on-screen movement (x right, y down).
 */
export function resolveTwist(
  cubie: Cubie,
  localNormal: Vec,
  drag: readonly [number, number],
  view: Mat3,
): Move | null {
  const normal = roundVec(mulVec(cubie.rot, localNormal));
  const normalAxis = normal.findIndex((v) => v !== 0);
  let best: { axis: number; sign: 1 | -1; score: number } | undefined;
  for (let axis = 0; axis < 3; axis++) {
    if (axis === normalAxis) continue;
    const unit: Vec = [axis === 0 ? 1 : 0, axis === 1 ? 1 : 0, axis === 2 ? 1 : 0];
    const onScreen = mulVec(view, unit);
    const length = Math.hypot(onScreen[0], onScreen[1]);
    if (length < 0.15) continue;
    const along = (drag[0] * onScreen[0] + drag[1] * onScreen[1]) / length;
    if (!best || Math.abs(along) > best.score)
      best = { axis, sign: along >= 0 ? 1 : -1, score: Math.abs(along) };
  }
  if (!best) return null;
  const moved: Vec = [
    best.axis === 0 ? best.sign : 0,
    best.axis === 1 ? best.sign : 0,
    best.axis === 2 ? best.sign : 0,
  ];
  // Pushing the surface along `moved` turns the layer about normal x moved.
  const spin = cross(normal, moved);
  const axis = spin.findIndex((v) => v !== 0) as 0 | 1 | 2;
  return {
    axis,
    layer: cubie.pos[axis] as -1 | 0 | 1,
    dir: spin[axis] > 0 ? 1 : -1,
  };
}
