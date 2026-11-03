import { disposeObject } from "@/lib/dispose-object";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  CanvasTexture,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { drawSectionScreen } from "@/lib/section-screen";
import { createScreenPortal } from "@/lib/screen-portal";
import { createScreenBrowser, type ScreenBrowser } from "@/lib/screen-browser";
import { showcaseDelay } from "@/lib/showcase-timing";
import type { ShowcaseProject } from "@/types/showcase";

export type DeviceScene = {
  setProject: (index: number, animate: boolean) => void;
  finishTransition: () => void;
  setMotion: (enabled: boolean) => void;
  setScroll: (progress: number) => void;
  dispose: () => void;
};

// The laptop turns about its vertical axis: front-on, then to one side and back,
// alternating sides as each website opens. About 35 degrees reads clearly while
// keeping the live site legible; raise it for a more dramatic side-on view.
const LAPTOP_SWAY_YAW = 0.62;
const LAPTOP_TILT = -0.03;
// Resting camera distance from the scene (was 6.8). Lower is closer.
const CAMERA_DISTANCE = 6.2;
// Dragging turns the device by hand; it eases back to its sway on release.
const DRAG_YAW_LIMIT = 1.0; // about 57 degrees each way
const DRAG_PITCH_LIMIT = 0.4; // about 23 degrees up or down
const DRAG_RETURN_DELAY_MS = 900;

const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};
/** 0 → 1 → 0 across one website's turn: rests front-on while its tab opens, turns away, returns. */
const swing = (phase: number) =>
  smoothstep(0.18, 0.48, phase) - smoothstep(0.58, 0.9, phase);

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable.");
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return { canvas, context, texture };
}

export async function createDeviceScene(
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
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  const stage = new Group();
  scene.add(stage);
  scene.add(new AmbientLight(0xffffff, 1.5));
  const key = new DirectionalLight(0xffffff, 4);
  key.position.set(3, 5, 5);
  scene.add(key);
  const rim = new DirectionalLight(0xd5ef8b, 2);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  const room = new RoomEnvironment();
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room).texture;
  scene.environment = environment;
  room.dispose();
  pmrem.dispose();
  let frame = 0;
  let disposed = false;
  let observer: ResizeObserver | undefined;
  let finish: (() => void) | undefined;
  let teardownDrag: (() => void) | undefined;
  let portal: ReturnType<typeof createScreenPortal>;
  const browserViews: ScreenBrowser[] = [];
  let inView = false;
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
    teardownDrag?.();
    portal?.dispose();
    visibility?.disconnect();
    browserViews.forEach((view) => view.dispose());
    renderer.domElement.removeEventListener("webglcontextlost", onLoss);
    disposeObject(stage);
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  try {
    const loader = new GLTFLoader();
    const [laptopResult, phoneResult] = await Promise.allSettled([
      loader.loadAsync("/models/laptop.glb"),
      loader.loadAsync("/models/iphone-16.glb"),
    ]);
    if (laptopResult.status === "fulfilled")
      stage.add(laptopResult.value.scene);
    if (phoneResult.status === "fulfilled") stage.add(phoneResult.value.scene);
    if (
      laptopResult.status !== "fulfilled" ||
      phoneResult.status !== "fulfilled" ||
      signal.aborted
    )
      throw new Error("Device assets unavailable.");
    const laptop = laptopResult.value.scene;
    const phone = phoneResult.value.scene;
    const phoneDisplay = phone.getObjectByName("Object_18");
    const laptopDisplay = laptop.getObjectByName("Screen_ComputerScreen_0");
    if (
      !(phoneDisplay instanceof Mesh) ||
      !(laptopDisplay instanceof Mesh) ||
      !(laptopDisplay.material instanceof MeshStandardMaterial) ||
      !laptopDisplay.material.map
    )
      throw new Error("Model screen geometry has changed.");

    const phoneCanvas = createCanvas(600, 1295);
    const laptopCanvas = createCanvas(1024, 1024);
    laptopCanvas.texture.flipY = false;
    const originalAtlas = laptopDisplay.material.map;
    const atlasImage = originalAtlas.image as CanvasImageSource;
    const phoneMaterial = new MeshBasicMaterial({
      map: phoneCanvas.texture,
      toneMapped: false,
    });
    const oldPhoneMaterials = Array.isArray(phoneDisplay.material)
      ? phoneDisplay.material
      : [phoneDisplay.material];
    oldPhoneMaterials.forEach((material) => material.dispose());
    phoneDisplay.material = phoneMaterial;
    phoneDisplay.geometry.computeBoundingBox();
    const bounds = phoneDisplay.geometry.boundingBox;
    if (!bounds) throw new Error("Phone screen has no bounds.");
    const positions = phoneDisplay.geometry.getAttribute("position");
    const uv: number[] = [];
    for (let i = 0; i < positions.count; i++)
      uv.push(
        (positions.getX(i) - bounds.min.x) / (bounds.max.x - bounds.min.x),
        (positions.getY(i) - bounds.min.y) / (bounds.max.y - bounds.min.y),
      );
    phoneDisplay.geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    const oldLaptopMaterial = laptopDisplay.material;
    laptopDisplay.material = new MeshBasicMaterial({
      map: laptopCanvas.texture,
      toneMapped: false,
    });
    for (const value of Object.values(oldLaptopMaterial)) {
      if (value instanceof Texture && value !== originalAtlas) value.dispose();
    }
    oldLaptopMaterial.dispose();

    function applyScreen() {
      // The live browser windows cover both displays; the glass underneath is
      // plain, and the section portal opens from the same blank screen.
      if (screenIsPortal) drawSectionScreen(phoneCanvas.canvas, nextSectionId);
      else {
        phoneCanvas.context.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue("--ink")
          .trim();
        phoneCanvas.context.fillRect(0, 0, 600, 1295);
      }
      phoneCanvas.texture.needsUpdate = true;
      laptopCanvas.context.drawImage(atlasImage, 0, 0, 1024, 1024);
      // The supplied laptop's display occupies this region of its embedded UV atlas.
      laptopCanvas.context.save();
      laptopCanvas.context.translate(481, 1011);
      laptopCanvas.context.scale(1, -1);
      laptopCanvas.context.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue(screenIsPortal ? "--background" : "--ink")
        .trim();
      laptopCanvas.context.fillRect(0, 0, 534, 312);
      laptopCanvas.context.restore();
      laptopCanvas.texture.needsUpdate = true;
    }

    function normalize(model: Group, targetWidth: number) {
      model.updateMatrixWorld(true);
      const box = new Box3().setFromObject(model);
      const content = new Group();
      const center = box.getCenter(new Vector3());
      model.position.sub(center);
      content.add(model);
      content.scale.setScalar(targetWidth / box.getSize(new Vector3()).x);
      stage.add(content);
      return content;
    }
    const laptopGroup = normalize(laptop, 4.6);
    const phoneGroup = normalize(phone, 1.35);
    // Only one device is ever shown: the phone on small screens, the laptop
    // otherwise. Each one sits centred on its own.
    const phoneScale = phoneGroup.scale.x * 1.2;
    laptopGroup.position.set(0, -0.15, 0);
    phoneGroup.position.set(0, -0.05, 0);
    phoneGroup.scale.setScalar(phoneScale);

    const poses = [
      { laptop: [-0.05, -0.24, 0.02], phone: [-0.04, -0.22, -0.12] },
      { laptop: [0.04, 0.16, -0.03], phone: [0.03, 0.26, 0.1] },
      { laptop: [-0.02, -0.09, 0.04], phone: [-0.06, -0.1, -0.05] },
    ];
    const setPose = (index: number) => {
      const pose = poses[index % poses.length];
      laptopGroup.rotation.set(pose.laptop[0], pose.laptop[1], pose.laptop[2]);
      phoneGroup.rotation.set(pose.phone[0], pose.phone[1], pose.phone[2]);
      phoneGroup.position.y = -0.05;
      laptopGroup.position.y = -0.15;
    };
    const laptopScreen = laptopDisplay;
    const phoneScreen = phoneDisplay;
    const isMobile = () => window.innerWidth < 768;
    const localCorners = (mobile = isMobile()) =>
      mobile
        ? [
            [-3.26328, 7.042495, 0.3901],
            [3.26327, 7.042495, 0.3901],
            [3.26327, -7.042456, 0.3901],
            [-3.26328, -7.042456, 0.3901],
          ]
        : [
            [0.147, 0.185355, 0.0041],
            [-0.147, 0.185355, 0.0041],
            [-0.147, 0.015355, 0.0041],
            [0.147, 0.015355, 0.0041],
          ];
    const worldCorners = (mobile = isMobile()) => {
      const display = mobile ? phoneScreen : laptopScreen;
      display.updateWorldMatrix(true, false);
      return localCorners(mobile).map(([x, y, z]) =>
        display.localToWorld(new Vector3(x, y, z)),
      );
    };
    portal = createScreenPortal(host, nextSectionId, { refreshOnEntry: true });
    const laptopBrowser = createScreenBrowser(host, projects, {
      kind: "laptop",
      aspect: 0.294 / 0.17,
    });
    const phoneBrowser = createScreenBrowser(host, projects, {
      kind: "phone",
      aspect: 6.52655 / 14.08495,
    });
    browserViews.push(laptopBrowser, phoneBrowser);
    visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncLive();
    });
    visibility.observe(host);
    let current = 0;
    let moving = false;
    let scroll = 0;
    let screenIsPortal = false;
    let clock = 0;
    let projectStart = 0;
    // Sites load only while the hero is on screen, never during the scroll takeover.
    const syncLive = () => {
      const open = inView && scroll <= 0 && !document.hidden;
      const mobile = isMobile();
      laptopBrowser.setLive(open && !mobile);
      phoneBrowser.setLive(open && mobile);
    };
    let projectIndex = 0;
    let previousTime = 0;
    let transition:
      | {
          index: number;
          start: number;
          laptop: number[];
          phone: number[];
          swapped: boolean;
        }
      | undefined;
    const screenTarget = new Vector3();
    const origin = new Vector3();
    const gaze = new Vector3();
    const render = () => {
      if (!disposed) renderer.render(scene, camera);
    };
    let stageExtra = 0;
    let stageTop = 0;
    let stageBase = 0;
    // Fraction of the original stage height the view is shifted down by.
    const STAGE_LIFT = 0.04;
    function positionCamera() {
      const corners = worldCorners();
      screenTarget.copy(corners[0]).add(corners[2]).multiplyScalar(0.5);
      const right = corners[1].clone().sub(corners[0]);
      const up = corners[0].clone().sub(corners[3]);
      const normal = right.clone().cross(up).normalize();
      const tangent = Math.tan((camera.fov * Math.PI) / 360);
      const distance =
        Math.min(
          right.length() / (2 * tangent * camera.aspect),
          up.length() / (2 * tangent),
        ) * 0.97;
      const zoomProgress = scroll;
      const zoom = zoomProgress * zoomProgress * (3 - 2 * zoomProgress);
      origin.set(0, 1.15, CAMERA_DISTANCE * Math.max(1, 1.3 / camera.aspect));
      const offset = origin.clone().sub(screenTarget);
      const zoomDistance = Math.exp(
        Math.log(offset.length()) * (1 - zoom) + Math.log(distance) * zoom,
      );
      offset.normalize().lerp(normal, zoom).normalize();
      const framedTarget = corners[0]
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
      // Slide the view window down so the laptop sits higher in the stage,
      // using the empty band at the top. Fades out during the scroll zoom.
      if (camera.view?.enabled) {
        const lift =
          (stageExtra > 0 ? (1 - zoom) * STAGE_LIFT * stageBase : 0) -
          stageTop;
        if (camera.view.offsetY !== lift) {
          camera.view.offsetY = lift;
          camera.updateProjectionMatrix();
        }
      }
    }

    // Hand-turning state: targets follow the pointer, current values chase them.
    let dragging = false;
    let dragYaw = 0;
    let dragPitch = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    let hold = 0; // 0 → 1 while dragging: fades the automatic sway out
    let releasedAt = 0;
    let dragTime = 0;
    const dragActive = () =>
      dragging ||
      hold > 0.001 ||
      Math.abs(dragYaw) > 0.001 ||
      Math.abs(dragPitch) > 0.001 ||
      Math.abs(targetYaw) > 0.001 ||
      Math.abs(targetPitch) > 0.001;

    function draw(now: number) {
      frame = 0;
      if (disposed) return;
      {
        const dt = dragTime ? Math.min((now - dragTime) / 1000, 0.05) : 0;
        dragTime = now;
        if (!dragging && now - releasedAt > DRAG_RETURN_DELAY_MS) {
          const back = Math.exp(-dt * 1.8);
          targetYaw *= back;
          targetPitch *= back;
        }
        const follow = 1 - Math.exp(-dt * 14);
        dragYaw += (targetYaw - dragYaw) * follow;
        dragPitch += (targetPitch - dragPitch) * follow;
        hold += ((dragging ? 1 : 0) - hold) * (1 - Math.exp(-dt * 6));
        if (!dragActive()) {
          dragYaw = dragPitch = targetYaw = targetPitch = hold = 0;
        }
      }
      if (moving)
        clock += previousTime ? Math.min(now - previousTime, 50) / 1000 : 0;
      previousTime = now;
      setPose(current);
      if (transition) {
        const t = Math.min((now - transition.start) / 1000, 1);
        const eased = t * t * (3 - 2 * t);
        const pose = poses[transition.index % poses.length];
        laptopGroup.rotation.set(
          ...(pose.laptop.map(
            (value, i) =>
              transition!.laptop[i] + (value - transition!.laptop[i]) * eased,
          ) as [number, number, number]),
        );
        phoneGroup.rotation.set(
          ...(pose.phone.map(
            (value, i) =>
              transition!.phone[i] + (value - transition!.phone[i]) * eased,
          ) as [number, number, number]),
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
      const mobile = isMobile();
      laptopGroup.visible = !mobile;
      phoneGroup.visible = mobile;
      const align = Math.min(1, scroll / 0.3);
      const activeGroup = mobile ? phoneGroup : laptopGroup;
      if (mobile) {
        activeGroup.rotation.y +=
          Math.sin(clock * 0.65) * 0.16 * drift * (1 - hold) + dragYaw;
        activeGroup.position.y += Math.sin(clock * 0.8 + 1) * 0.14 * drift;
      } else {
        // Laptop: one deliberate turn per website, in step with the tab changes.
        // Wall-clock phase, like the tab timer, so a slow frame rate never
        // lets the turn drift out of step with the tab changes.
        const phase = Math.min(1, (performance.now() - projectStart) / showcaseDelay(projects[projectIndex]));
        const side = projectIndex % 2 === 0 ? 1 : -1;
        laptopGroup.rotation.set(
          LAPTOP_TILT + dragPitch,
          side * LAPTOP_SWAY_YAW * (moving ? swing(phase) : 0) * drift * (1 - hold) +
            dragYaw,
          0,
        );
        laptopGroup.position.y = -0.15;
      }
      activeGroup.rotation.x *= 1 - align;
      activeGroup.rotation.y *= 1 - align;
      activeGroup.rotation.z *= 1 - align;
      positionCamera();
      render();
      {
        const corners = worldCorners().map((world) => {
          const point = world.project(camera);
          return {
            x: ((point.x + 1) * host.clientWidth) / 2,
            y: ((1 - point.y) * host.clientHeight) / 2,
          };
        }) as [
          { x: number; y: number },
          { x: number; y: number },
          { x: number; y: number },
          { x: number; y: number },
        ];
        portal?.update(corners, scroll, mobile);
        const open = scroll <= 0;
        laptopBrowser.update(corners, !mobile && open);
        phoneBrowser.update(corners, mobile && open);
        syncLive();
      }
      if (moving || transition || dragActive()) frame = requestAnimationFrame(draw);
    }
    function schedule() {
      if (!frame && !disposed) frame = requestAnimationFrame(draw);
    }
    function resize() {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height || disposed) return;
      // The stage has extra room below its original frame (CSS padding-bottom).
      // Frame the camera on the original area and render the extra strip below.
      const parent = host.parentElement;
      const style = parent ? getComputedStyle(parent) : undefined;
      const top = style ? parseFloat(style.paddingTop) || 0 : 0;
      const bottom = style ? parseFloat(style.paddingBottom) || 0 : 0;
      const extra = Math.max(0, Math.min(height / 2, bottom));
      const base = Math.max(1, height - top - bottom);
      stageExtra = extra;
      stageTop = top;
      stageBase = base;
      camera.aspect = width / base;
      camera.setViewOffset(width, base, 0, 0, width, height);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      schedule();
    }
    applyScreen();
    setPose(0);
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
    // Drag to turn the device. Mouse and pen turn both ways; touch turns
    // sideways only, so vertical swipes still scroll the page.
    {
      let lastX = 0;
      let lastY = 0;
      let travelled = 0;
      let touch = false;
      const clamp = (value: number, limit: number) =>
        Math.max(-limit, Math.min(limit, value));
      const swallowClick = (event: MouseEvent) => event.stopPropagation();
      const onMove = (event: PointerEvent) => {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        travelled += Math.abs(dx) + Math.abs(dy);
        targetYaw = clamp(targetYaw + dx * 0.008, DRAG_YAW_LIMIT);
        if (!touch)
          targetPitch = clamp(targetPitch + dy * 0.006, DRAG_PITCH_LIMIT);
        schedule();
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        if (!dragging) return;
        dragging = false;
        releasedAt = performance.now();
        // Restart the automatic turn from rest, in step with the tab timer.
        projectStart = releasedAt;
        delete host.dataset.dragging;
        if (travelled > 4) {
          // The pointer-up after a drag must not count as a click on the screen.
          host.addEventListener("click", swallowClick, {
            capture: true,
            once: true,
          });
          setTimeout(
            () => host.removeEventListener("click", swallowClick, true),
            0,
          );
        }
        schedule();
      };
      const onDown = (event: PointerEvent) => {
        if (event.button !== 0 || scroll > 0 || disposed) return;
        dragging = true;
        touch = event.pointerType === "touch";
        lastX = event.clientX;
        lastY = event.clientY;
        travelled = 0;
        host.dataset.dragging = "";
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        schedule();
      };
      host.style.touchAction = "pan-y";
      host.addEventListener("pointerdown", onDown);
      teardownDrag = () => {
        host.removeEventListener("pointerdown", onDown);
        onUp();
      };
    }
    return {
      setProject(index, animate) {
        if (disposed) return;
        laptopBrowser.setActive(index, animate && index !== current);
        phoneBrowser.setActive(index, animate && index !== current);
        projectStart = performance.now();
        projectIndex = index;
        if (!animate || index === current) {
          current = index;
          transition = undefined;
          applyScreen();
        } else
          transition = {
            index,
            swapped: false,
            start: performance.now(),
            laptop: [
              laptopGroup.rotation.x,
              laptopGroup.rotation.y,
              laptopGroup.rotation.z,
            ],
            phone: [
              phoneGroup.rotation.x,
              phoneGroup.rotation.y,
              phoneGroup.rotation.z,
            ],
          };
        schedule();
      },
      setMotion(enabled) {
        moving = enabled;
        previousTime = 0;
        if (enabled) projectStart = performance.now();
        if (!enabled) finish?.();
        schedule();
      },
      setScroll(progress) {
        const entering = progress > 0 && progress < 1;
        if (entering !== screenIsPortal) {
          screenIsPortal = entering;
          if (entering) {
            if (isMobile()) {
              drawSectionScreen(phoneCanvas.canvas, nextSectionId);
              phoneCanvas.texture.needsUpdate = true;
            } else {
              laptopCanvas.context.fillStyle = getComputedStyle(
                document.documentElement,
              )
                .getPropertyValue("--background")
                .trim();
              laptopCanvas.context.fillRect(481, 699, 534, 312);
              laptopCanvas.texture.needsUpdate = true;
            }
          } else applyScreen();
        }
        scroll = progress;
        syncLive();
        schedule();
      },
      finishTransition() {
        finish?.();
      },
      dispose() {
        originalAtlas.dispose();
        dispose();
      },
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
