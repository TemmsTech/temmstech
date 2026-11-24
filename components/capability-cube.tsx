"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { useMediaQuery } from "@/hooks";
import {
  FACES,
  FACE_TRANSFORMS,
  applyMove,
  axisRotation,
  createCubies,
  cubieTransform,
  isSolved,
  mulMat3,
  mulVec,
  randomMoves,
  resolveTwist,
  stickerOf,
  viewMatrix,
  type Cubie,
  type Move,
} from "@/lib/rubik-cube";
import "./capability-cube.css";

/** One photo per side of the cube: front, back, right, left, top, bottom. */
export type CubeFace = { src: string; caption: string };

type Phase = "grid" | "to-cube" | "cube" | "to-grid";
type Controls = {
  shuffle: () => void;
  reset: () => void;
  leave: () => void;
  turn: (dx: number, dy: number) => void;
};

const noise = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const SCATTER_X = Array.from({ length: 27 }, (_, i) => (noise(i) - 0.5) * 5.4);
const SCATTER_Y = Array.from({ length: 27 }, (_, i) => (noise(i + 40) - 0.5) * 5.4);

/**
 * The hero's mosaic, plus a button that breaks it apart and rebuilds it as a
 * photo cube the visitor can turn, twist, shuffle and solve. Every solved side
 * is one full photograph cut into nine tiles, so twisting scrambles the picture.
 */
export function CapabilityCube({
  faces,
  children,
}: {
  faces: readonly CubeFace[];
  children: ReactNode;
}) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const [phase, setPhase] = useState<Phase>("grid");
  const grid = useRef<HTMLDivElement>(null);
  const controls = useRef<Controls | null>(null);
  const timer = useRef(0);
  const showCube = phase === "cube" || phase === "to-grid";

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    // The mosaic is hidden while the cube is up, so keep it out of reach too.
    if (grid.current) grid.current.inert = showCube;
  }, [showCube]);

  const toCube = () => {
    if (phase !== "grid") return;
    setPhase("to-cube");
    timer.current = window.setTimeout(
      () => setPhase("cube"),
      reduced ? 0 : 440,
    );
  };
  const toGrid = () => {
    if (phase !== "cube") return;
    setPhase("to-grid");
    controls.current?.leave();
  };
  const busy = phase === "to-cube" || phase === "to-grid";

  return (
    <div className="capability-cube" data-phase={phase}>
      <div className="capability-cube-viewport">
        <div ref={grid} className="capability-cube-grid">
          {children}
        </div>
        {showCube && (
          <CubeStage
            faces={faces}
            reduced={reduced}
            onControls={(next) => {
              controls.current = next;
            }}
            onLeft={() => setPhase("grid")}
          />
        )}
      </div>
      <div className="capability-cube-bar">
        {phase === "grid" || phase === "to-cube" ? (
          <button
            type="button"
            className="cube-btn"
            onClick={toCube}
            disabled={busy}
          >
            <CubeIcon /> Turn it into a cube
          </button>
        ) : (
          <>
            <button
              type="button"
              className="cube-btn"
              onClick={() => controls.current?.shuffle()}
              disabled={busy}
            >
              Shuffle
            </button>
            <button
              type="button"
              className="cube-btn"
              onClick={() => controls.current?.reset()}
              disabled={busy}
            >
              Reset
            </button>
            <button
              type="button"
              className="cube-btn"
              onClick={toGrid}
              disabled={busy}
            >
              Back to grid
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Zm0 9 8-4.5M12 12 4 7.5M12 12v9" />
    </svg>
  );
}

function CubeStage({
  faces,
  reduced,
  onControls,
  onLeft,
}: {
  faces: readonly CubeFace[];
  reduced: boolean;
  onControls: (controls: Controls | null) => void;
  onLeft: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const onLeftRef = useRef(onLeft);
  const onControlsRef = useRef(onControls);
  const controls = useRef<Controls | null>(null);
  useEffect(() => {
    onLeftRef.current = onLeft;
    onControlsRef.current = onControls;
  });
  const [cubies] = useState(createCubies);
  const [front, setFront] = useState(0);
  const [solved, setSolved] = useState(true);

  useEffect(() => {
    const stageEl = stage.current;
    const worldEl = world.current;
    if (!stageEl || !worldEl) return;
    let state: Cubie[] = createCubies();
    let size = 100;
    let rx = -24;
    let ry = -34;
    let spread = reduced ? 1 : 0;
    let spreadTarget = 1;
    let turn: { move: Move; start: number; duration: number } | null = null;
    const queue: { move: Move; duration: number }[] = [];
    let auto = !reduced;
    let visible = true;
    let leaving = false;
    let raf = 0;
    let last = 0;
    let frontNow = 0;
    let solvedNow = true;

    const paint = () => {
      const eased = 1 - Math.pow(1 - spread, 3);
      worldEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      let turning:
        | { axis: 0 | 1 | 2; layer: number; angle: number }
        | undefined;
      if (turn) {
        const p =
          turn.duration <= 0
            ? 1
            : Math.min(1, (performance.now() - turn.start) / turn.duration);
        const smooth = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        turning = {
          axis: turn.move.axis,
          layer: turn.move.layer,
          angle: turn.move.dir * (Math.PI / 2) * smooth,
        };
      }
      const apart = 1 + (1 - eased) * 2.2;
      for (const cubie of state) {
        const node = nodes.current[cubie.id];
        if (!node) continue;
        const tumble =
          eased < 1
            ? mulMat3(
                axisRotation(0, SCATTER_X[cubie.id] * (1 - eased)),
                axisRotation(1, SCATTER_Y[cubie.id] * (1 - eased)),
              )
            : undefined;
        node.style.transform = cubieTransform(
          cubie,
          size,
          apart,
          turning,
          tumble,
        );
        node.style.opacity = eased < 1 ? String(Math.min(1, eased * 2)) : "";
      }
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(now - last, 50) : 0;
      last = now;
      let busy = false;
      if (spread !== spreadTarget) {
        const step = dt / (spreadTarget > spread ? 950 : 520);
        spread =
          spreadTarget > spread
            ? Math.min(1, spread + step)
            : Math.max(0, spread - step);
        busy = true;
        if (leaving && spread === 0) {
          leaving = false;
          onLeftRef.current();
          return;
        }
      }
      if (turn && (turn.duration <= 0 || now - turn.start >= turn.duration)) {
        state = applyMove(state, turn.move);
        turn = null;
        const done = isSolved(state);
        if (done !== solvedNow) {
          solvedNow = done;
          setSolved(done);
        }
      }
      if (!turn && queue.length && spread >= 1) {
        const next = queue.shift()!;
        turn = {
          move: next.move,
          start: now,
          duration: reduced ? 0 : next.duration,
        };
      }
      if (turn || queue.length) busy = true;
      if (auto && visible && !document.hidden && !reduced) {
        ry += dt * 0.014;
        busy = true;
      }
      paint();
      const view = viewMatrix(rx, ry);
      let best = 0;
      let bestZ = -Infinity;
      FACES.forEach((face, index) => {
        const z = mulVec(view, face.normal)[2];
        if (z > bestZ) {
          bestZ = z;
          best = index;
        }
      });
      if (best !== frontNow) {
        frontNow = best;
        setFront(best);
      }
      if (busy) schedule();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const { width, height } = stageEl.getBoundingClientRect();
      if (!width || !height) return;
      const side = Math.min(width, height) * 0.54;
      size = side / 3;
      stageEl.style.setProperty("--s", `${size}px`);
      stageEl.style.perspective = `${side * 4.2}px`;
      paint();
      schedule();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stageEl);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    });
    visibility.observe(stageEl);

    type Drag = {
      id: number;
      sx: number;
      sy: number;
      lx: number;
      ly: number;
      sticker: { cubie: number; face: number } | null;
      done: boolean;
    };
    let drag: Drag | null = null;
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (target.closest("button") || spread < 1 || leaving) return;
      const sticker = event.shiftKey
        ? null
        : target.closest<HTMLElement>("[data-face]");
      drag = {
        id: event.pointerId,
        sx: event.clientX,
        sy: event.clientY,
        lx: event.clientX,
        ly: event.clientY,
        sticker: sticker
          ? {
              cubie: Number(sticker.dataset.cubie),
              face: Number(sticker.dataset.face),
            }
          : null,
        done: false,
      };
      stageEl.setPointerCapture(event.pointerId);
      stageEl.dataset.dragging = "true";
      auto = false;
    };
    const onMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.lx;
      const dy = event.clientY - drag.ly;
      drag.lx = event.clientX;
      drag.ly = event.clientY;
      if (!drag.sticker) {
        ry += dx * 0.45;
        rx = Math.max(-85, Math.min(85, rx - dy * 0.45));
        schedule();
        return;
      }
      if (drag.done) return;
      const tx = event.clientX - drag.sx;
      const ty = event.clientY - drag.sy;
      if (Math.hypot(tx, ty) < 14) return;
      drag.done = true;
      if (turn || queue.length) return;
      const { cubie: id, face } = drag.sticker;
      const cubie = state.find((item) => item.id === id);
      if (!cubie) return;
      const move = resolveTwist(
        cubie,
        FACES[face].normal,
        [tx, ty],
        viewMatrix(rx, ry),
      );
      if (move) {
        queue.push({ move, duration: 280 });
        schedule();
      }
    };
    const onUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      delete stageEl.dataset.dragging;
    };
    stageEl.addEventListener("pointerdown", onDown);
    stageEl.addEventListener("pointermove", onMove);
    stageEl.addEventListener("pointerup", onUp);
    stageEl.addEventListener("pointercancel", onUp);

    const api: Controls = {
      shuffle() {
        if (spread < 1 || leaving) return;
        auto = false;
        queue.push(
          ...randomMoves(20).map((move) => ({ move, duration: 150 })),
        );
        schedule();
      },
      reset() {
        if (leaving) return;
        queue.length = 0;
        turn = null;
        state = createCubies();
        solvedNow = true;
        setSolved(true);
        if (!reduced) spread = 0;
        spreadTarget = 1;
        schedule();
      },
      leave() {
        queue.length = 0;
        turn = null;
        leaving = true;
        spreadTarget = 0;
        if (reduced) {
          spread = 0;
          leaving = false;
          onLeftRef.current();
          return;
        }
        schedule();
      },
      turn(dx, dy) {
        auto = false;
        ry += dx;
        rx = Math.max(-85, Math.min(85, rx + dy));
        schedule();
      },
    };
    controls.current = api;
    onControlsRef.current(api);

    paint();
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibility.disconnect();
      stageEl.removeEventListener("pointerdown", onDown);
      stageEl.removeEventListener("pointermove", onMove);
      stageEl.removeEventListener("pointerup", onUp);
      stageEl.removeEventListener("pointercancel", onUp);
      controls.current = null;
      onControlsRef.current(null);
    };
  }, [reduced]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = 10;
    const turns: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const turn = turns[event.key];
    if (!turn) return;
    event.preventDefault();
    controls.current?.turn(turn[0], turn[1]);
  };

  return (
    <div
      ref={stage}
      className="cube-stage"
      role="group"
      aria-label="Interactive photo cube. Drag the background or use the arrow keys to turn it. Drag across a row or column of the cube to twist it."
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <p className="cube-hint">
        Drag around the cube to turn it · drag across a row to twist it
      </p>
      <div ref={world} className="cube-world" aria-hidden="true">
        {cubies.map((cubie) => (
          <div
            key={cubie.id}
            ref={(node) => {
              nodes.current[cubie.id] = node;
            }}
            className="cube-cubie"
          >
            {FACES.map((_, faceIndex) => {
              const sticker = stickerOf(cubie.home, faceIndex);
              return (
                <div
                  key={faceIndex}
                  className="cube-face"
                  style={{ transform: FACE_TRANSFORMS[faceIndex] }}
                  {...(sticker
                    ? {
                        "data-face": faceIndex,
                        "data-cubie": cubie.id,
                      }
                    : {})}
                >
                  {sticker && (
                    <span
                      className="cube-sticker"
                      style={{
                        backgroundImage: `url(${JSON.stringify(faces[faceIndex]?.src ?? "")})`,
                        backgroundPosition: `${sticker.col * 50}% ${sticker.row * 50}%`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="cube-caption" aria-live="polite">
        {solved
          ? (faces[front]?.caption ?? "")
          : "Mixed up. Twist it back to restore the pictures."}
      </p>
    </div>
  );
}
