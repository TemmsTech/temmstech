import {
  AmbientLight,
  Box3,
  CanvasTexture,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { disposeObject } from "@/lib/dispose-object";
import { createScreenPortal } from "@/lib/screen-portal";
import { createScreenBrowser, type ScreenBrowser } from "@/lib/screen-browser";
import type { DeviceScene } from "@/lib/device-scene";
import type { ShowcaseProject } from "@/types/showcase";

type Point = { x: number; y: number };
type Quad = [Point, Point, Point, Point];

/**
 * Hero scene for tablets: a single tablet that drifts, cycles through the
 * projects on its screen, then zooms into that screen while the next section
 * is projected onto it. Same contract as the laptop/phone scene, so it plugs
 * into the same scroll driver.
 */
export async function createTabletHeroScene(
  host: HTMLElement,
  projects: readonly ShowcaseProject[],
  signal: AbortSignal,
  onContextLost: () => void,
  nextSectionId: string,
): Promise<DeviceScene> {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  const stage = new Group();
  scene.add(stage, new AmbientLight(0xffffff, 2));
  const light = new DirectionalLight(0xffffff, 3);
  light.position.set(3, 4, 6);
  scene.add(light);
  let frame = 0;
  let disposed = false;
  let observer: ResizeObserver | undefined;
  let portal: ReturnType<typeof createScreenPortal> = null;
  let finish: (() => void) | undefined;
  let browser: ScreenBrowser | undefined;
  let visibility: IntersectionObserver | undefined;

  const onLoss = (event: Event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    if (!disposed) onContextLost();
  };
  renderer.domElement.addEventListener("webglcontextlost", onLoss);
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    portal?.dispose();
    visibility?.disconnect();
    browser?.dispose();
    renderer.domElement.removeEventListener("webglcontextlost", onLoss);
    disposeObject(stage);
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  try {
    const gltf = await new GLTFLoader().loadAsync(
      "/models/microsoft-tablet.glb",
    );
    if (signal.aborted) throw new Error("Tablet loading cancelled");
    const model = gltf.scene;
    const body = new Group();
    body.add(model);
    stage.add(body);
    model.rotation.set(Math.PI, 0, 0);
    model.scale.setScalar(22);
    model.updateMatrixWorld(true);
    model.position.sub(new Box3().setFromObject(model).getCenter(new Vector3()));
    model.updateMatrixWorld(true);

    // Same screen lookup as the section transition's tablet.
    const display = new Box3();
    model.traverse((child) => {
      if (
        child instanceof Mesh &&
        !Array.isArray(child.material) &&
        child.material.name === "Material0_1"
      )
        display.setFromObject(child);
    });
    if (display.isEmpty()) throw new Error("Tablet display missing");
    const size = display.getSize(new Vector3());
    const insetX = size.x * 0.055,
      insetY = size.y * 0.07;
    const left = display.min.x + insetX,
      right = display.max.x - insetX;
    const top = display.max.y - insetY,
      bottom = display.min.y + insetY;
    const z = display.max.z + 0.002;
    const corners = [
      new Vector3(left, top, z),
      new Vector3(right, top, z),
      new Vector3(right, bottom, z),
      new Vector3(left, bottom, z),
    ];
    const aspect = (right - left) / (top - bottom);

    // A plane just in front of the glass is the blank screen under the live browser window
    // and the one the section portal opens from.
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = Math.round(1280 / aspect);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    const plane = new Mesh(
      new PlaneGeometry(right - left, top - bottom),
      new MeshBasicMaterial({ map: texture, toneMapped: false }),
    );
    plane.position.set((left + right) / 2, (top + bottom) / 2, z);
    body.add(plane);

    // Fit the whole tablet to the same footprint the laptop uses.
    const width = new Box3().setFromObject(model).getSize(new Vector3()).x;
    body.scale.setScalar(4.2 / width);
    body.position.y = -0.1;

    const background = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim();
    const ink = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
    let screenIsPortal = false;
    function applyScreen() {
      if (!context) return;
      context.fillStyle = screenIsPortal ? background() : ink();
      context.fillRect(0, 0, canvas.width, canvas.height);
      texture.needsUpdate = true;
    }

    portal = createScreenPortal(host, nextSectionId, {
      aspectRatio: aspect,
      refreshOnEntry: true,
    });
    const tabletBrowser = createScreenBrowser(host, projects, {
      kind: "tablet",
      aspect,
    });
    browser = tabletBrowser;
    let inView = false;
    const syncLive = () =>
      tabletBrowser.setLive(inView && scroll <= 0 && !document.hidden);
    visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncLive();
    });
    visibility.observe(host);
    const worldCorners = () => {
      body.updateWorldMatrix(true, false);
      return corners.map((point) => body.localToWorld(point.clone()));
    };

    const poses = [
      [-0.05, -0.24, 0.02],
      [0.04, 0.16, -0.03],
      [-0.02, -0.09, 0.04],
    ];
    let current = 0;
    let moving = false;
    let scroll = 0;
    let clock = 0;
    let previousTime = 0;
    let transition:
      | { index: number; start: number; from: number[]; swapped: boolean }
      | undefined;
    const screenTarget = new Vector3();
    const origin = new Vector3();
    const gaze = new Vector3();

    function positionCamera() {
      const c = worldCorners();
      screenTarget.copy(c[0]).add(c[2]).multiplyScalar(0.5);
      const right = c[1].clone().sub(c[0]);
      const up = c[0].clone().sub(c[3]);
      const normal = right.clone().cross(up).normalize();
      const tangent = Math.tan((camera.fov * Math.PI) / 360);
      const distance =
        Math.min(
          right.length() / (2 * tangent * camera.aspect),
          up.length() / (2 * tangent),
        ) * 0.97;
      const zoom = scroll * scroll * (3 - 2 * scroll);
      origin.set(0, 1.15, 6.8 * Math.max(1, 1.3 / camera.aspect));
      const offset = origin.clone().sub(screenTarget);
      const zoomDistance = Math.exp(
        Math.log(offset.length()) * (1 - zoom) + Math.log(distance) * zoom,
      );
      offset.normalize().lerp(normal, zoom).normalize();
      const framedTarget = c[0]
        .clone()
        .addScaledVector(
          right.clone().normalize(),
          distance * tangent * camera.aspect,
        )
        .addScaledVector(up.clone().normalize(), -distance * tangent);
      const framing = framedTarget.sub(screenTarget).multiplyScalar(zoom);
      camera.position
        .copy(screenTarget)
        .add(framing)
        .addScaledVector(offset, zoomDistance);
      gaze.set(0, 0.05, 0).lerp(screenTarget, zoom).add(framing);
      camera.up.set(0, 1, 0).lerp(up.normalize(), zoom).normalize();
      camera.lookAt(gaze);
    }

    function draw(now: number) {
      frame = 0;
      if (disposed) return;
      if (moving)
        clock += previousTime ? Math.min(now - previousTime, 50) / 1000 : 0;
      previousTime = now;
      const rest = poses[current % poses.length];
      body.rotation.set(rest[0], rest[1], rest[2]);
      if (transition) {
        const t = Math.min((now - transition.start) / 1000, 1);
        const eased = t * t * (3 - 2 * t);
        const next = poses[transition.index % poses.length];
        body.rotation.set(
          transition.from[0] + (next[0] - transition.from[0]) * eased,
          transition.from[1] + (next[1] - transition.from[1]) * eased,
          transition.from[2] + (next[2] - transition.from[2]) * eased,
        );
        if (t >= 0.45 && !transition.swapped) {
          applyScreen();
          transition.swapped = true;
        }
        if (t === 1) {
          current = transition.index;
          transition = undefined;
        }
      }
      const drift = 1 - scroll;
      const align = Math.min(1, scroll / 0.3);
      body.position.y = -0.1 + Math.sin(clock * 0.7) * 0.09 * drift;
      body.rotation.y += Math.sin(clock * 0.55) * 0.12 * drift;
      body.rotation.z += Math.sin(clock * 0.4) * 0.025 * drift;
      body.rotation.x *= 1 - align;
      body.rotation.y *= 1 - align;
      body.rotation.z *= 1 - align;
      positionCamera();
      if (!disposed) renderer.render(scene, camera);
      if (portal) {
        const projected = worldCorners().map((world) => {
          const point = world.project(camera);
          return {
            x: ((point.x + 1) * host.clientWidth) / 2,
            y: ((1 - point.y) * host.clientHeight) / 2,
          };
        }) as Quad;
        portal.update(projected, scroll, false);
      }
      {
        const projected = worldCorners().map((world) => {
          const point = world.project(camera);
          return {
            x: ((point.x + 1) * host.clientWidth) / 2,
            y: ((1 - point.y) * host.clientHeight) / 2,
          };
        }) as Quad;
        tabletBrowser.update(projected, scroll <= 0);
        syncLive();
      }
      if (moving || transition) frame = requestAnimationFrame(draw);
    }
    function schedule() {
      if (!frame && !disposed) frame = requestAnimationFrame(draw);
    }
    function resize() {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h || disposed) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      schedule();
    }
    applyScreen();
    host.appendChild(renderer.domElement);
    observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    finish = () => {
      if (transition) {
        current = transition.index;
        applyScreen();
        transition = undefined;
      }
      schedule();
    };
    return {
      setProject(index, animate) {
        if (disposed) return;
        tabletBrowser.setActive(index, animate && index !== current);
        if (!animate || index === current) {
          current = index;
          transition = undefined;
          applyScreen();
        } else
          transition = {
            index,
            swapped: false,
            start: performance.now(),
            from: [body.rotation.x, body.rotation.y, body.rotation.z],
          };
        schedule();
      },
      setMotion(enabled) {
        moving = enabled;
        previousTime = 0;
        if (!enabled) finish?.();
        schedule();
      },
      setScroll(progress) {
        const entering = progress > 0 && progress < 1;
        if (entering !== screenIsPortal) {
          screenIsPortal = entering;
          applyScreen();
        }
        scroll = progress;
        schedule();
      },
      finishTransition() {
        finish?.();
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
