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
import type { CapturedProject } from "@/types/showcase";

export type DeviceScene = {
  setProject: (index: number, animate: boolean) => void;
  finishTransition: () => void;
  setMotion: (enabled: boolean) => void;
  setScroll: (progress: number) => void;
  dispose: () => void;
};

type ScreenPair = { desktop: HTMLImageElement; mobile: HTMLImageElement };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load showcase image."));
    image.src = src;
  });
}

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
  projects: readonly CapturedProject[],
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
  let portal: ReturnType<typeof createScreenPortal>;

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
    renderer.domElement.removeEventListener("webglcontextlost", onLoss);
    disposeObject(stage);
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  try {
    const loader = new GLTFLoader();
    const [laptopResult, phoneResult, screensResult] = await Promise.allSettled(
      [
        loader.loadAsync("/models/laptop.glb"),
        loader.loadAsync("/models/iphone-16.glb"),
        Promise.all(
          projects.map(async (project): Promise<ScreenPair> => ({
            desktop: await loadImage(project.desktopImage),
            mobile: await loadImage(project.mobileImage),
          })),
        ),
      ],
    );
    if (laptopResult.status === "fulfilled")
      stage.add(laptopResult.value.scene);
    if (phoneResult.status === "fulfilled") stage.add(phoneResult.value.scene);
    if (
      laptopResult.status !== "fulfilled" ||
      phoneResult.status !== "fulfilled" ||
      screensResult.status !== "fulfilled" ||
      signal.aborted
    )
      throw new Error("Device assets unavailable.");
    const laptop = laptopResult.value.scene;
    const phone = phoneResult.value.scene;
    const screens = screensResult.value;
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

    function applyScreen(index: number) {
      const pair = screens[index];
      if (!pair) return;
      if (screenIsPortal) drawSectionScreen(phoneCanvas.canvas, nextSectionId);
      else phoneCanvas.context.drawImage(pair.mobile, 0, 0, 600, 1295);
      phoneCanvas.texture.needsUpdate = true;
      laptopCanvas.context.drawImage(atlasImage, 0, 0, 1024, 1024);
      // The supplied laptop's display occupies this region of its embedded UV atlas.
      laptopCanvas.context.save();
      laptopCanvas.context.translate(481, 1011);
      laptopCanvas.context.scale(1, -1);
      if (typeof screenIsPortal !== "undefined" && screenIsPortal) {
        laptopCanvas.context.fillStyle = getComputedStyle(
          document.documentElement,
        )
          .getPropertyValue("--background")
          .trim();
        laptopCanvas.context.fillRect(0, 0, 534, 312);
      } else laptopCanvas.context.drawImage(pair.desktop, 0, 0, 534, 312);
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
    let current = 0;
    let moving = false;
    let scroll = 0;
    let screenIsPortal = false;
    let clock = 0;
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
      origin.set(0, 1.15, 6.8 * Math.max(1, 1.3 / camera.aspect));
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
    }

    function draw(now: number) {
      frame = 0;
      if (disposed) return;
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
          applyScreen(transition.index);
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
      activeGroup.rotation.y += Math.sin(clock * (mobile ? 0.65 : 0.55)) * (mobile ? 0.16 : 0.12) * drift;
      activeGroup.position.y += Math.sin(clock * (mobile ? 0.8 : 0.7) + (mobile ? 1 : 0)) * (mobile ? 0.14 : 0.09) * drift;
      if (!mobile) activeGroup.rotation.z += Math.sin(clock * 0.4) * 0.025 * drift;
      activeGroup.rotation.x *= 1 - align;
      activeGroup.rotation.y *= 1 - align;
      activeGroup.rotation.z *= 1 - align;
      positionCamera();
      render();
      if (portal) {
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
        portal.update(corners, scroll, mobile);
      }
      if (moving || transition) frame = requestAnimationFrame(draw);
    }
    function schedule() {
      if (!frame && !disposed) frame = requestAnimationFrame(draw);
    }
    function resize() {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height || disposed) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      schedule();
    }
    applyScreen(0);
    setPose(0);
    host.appendChild(renderer.domElement);
    observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    finish = () => {
      if (transition) {
        current = transition.index;
        applyScreen(current);
        transition = undefined;
      }
      schedule();
    };
    return {
      setProject(index, animate) {
        if (disposed) return;
        if (!animate || index === current) {
          current = index;
          transition = undefined;
          applyScreen(index);
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
          } else applyScreen(current);
        }
        scroll = progress;
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
