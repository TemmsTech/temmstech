import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  Mesh,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { disposeObject } from "@/lib/dispose-object";
import { createScreenPortal } from "@/lib/screen-portal";

export type TabletScene = {
  render: (progress: number, stripHeight: number) => void;
  hide: () => void;
  dispose: () => void;
};

/**
 * Horizontal shift of the preview on the phone once it faces the camera, as a
 * fraction of the screen's width (positive = right, negative = left). The
 * preview is built from the screen's own corners, so 0 lines it up with the
 * glass exactly. If it ever looks off, nudge this a little instead of
 * changing the corners.
 */
const PHONE_NUDGE = 0;

export type TransitionDevice = "tablet" | "phone";

export async function createTabletScene(
  host: HTMLElement,
  sectionId: string,
  signal: AbortSignal,
  onFailure: () => void,
  device: TransitionDevice = "tablet",
): Promise<TabletScene> {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new Scene();
  const stage = new Group();
  scene.add(stage, new AmbientLight(0xffffff, 2));
  const light = new DirectionalLight(0xffffff, 3);
  light.position.set(3, 4, 6);
  scene.add(light);
  const camera = new PerspectiveCamera(35, 1, 0.01, 100);
  let portal: ReturnType<typeof createScreenPortal>;
  let disposed = false;
  const onLoss = (event: Event) => {
    event.preventDefault();
    onFailure();
  };
  renderer.domElement.addEventListener("webglcontextlost", onLoss);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    portal?.dispose();
    disposeObject(stage);
    renderer.domElement.removeEventListener("webglcontextlost", onLoss);
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
  try {
    const phone = device === "phone";
    const { scene: model } = await new GLTFLoader().loadAsync(
      phone ? "/models/iphone-16.glb" : "/models/microsoft-tablet.glb",
    );
    stage.add(model);
    if (signal.aborted) throw new Error("Device loading cancelled");
    // The tablet model is authored upside down; the phone already faces +z.
    if (!phone) model.rotation.set(Math.PI, 0, 0);
    model.scale.setScalar(phone ? 0.1 : 22);
    model.updateMatrixWorld(true);
    const center = new Box3().setFromObject(model).getCenter(new Vector3());
    model.position.sub(center);
    model.updateMatrixWorld(true);
    const display = new Box3();
    if (phone) {
      const screen = model.getObjectByName("Object_18");
      if (screen instanceof Mesh) display.setFromObject(screen);
    } else {
      model.traverse((child) => {
        if (
          child instanceof Mesh &&
          !Array.isArray(child.material) &&
          child.material.name === "Material0_1"
        )
          display.setFromObject(child);
      });
    }
    if (display.isEmpty()) throw new Error("Device display missing");
    // The tablet's glass includes its bezel, so keep the preview inside it.
    // The phone's display mesh is the screen itself.
    const size = display.getSize(new Vector3());
    const insetX = phone ? 0 : size.x * 0.055,
      insetY = phone ? 0 : size.y * 0.07;
    const baseLeft = display.min.x + insetX,
      baseRight = display.max.x - insetX;
    const top = display.max.y - insetY,
      bottom = display.min.y + insetY;
    const z = display.max.z + 0.002;
    portal = createScreenPortal(host, sectionId, {
      aspectRatio: (baseRight - baseLeft) / (top - bottom),
      // A phone's screen is tall: fill it with the next sections too.
      fillScreen: phone,
      backdrop: false,
      settleFrom: 0.7,
      keepPageWidth: phone,
      refreshOnEntry: true,
    });
    host.prepend(renderer.domElement);
    const smooth = (value: number) => {
      const t = Math.max(0, Math.min(1, value));
      return t * t * (3 - 2 * t);
    };
    let lastWidth = 0,
      lastHeight = 0;
    return {
      render(progress, stripHeight) {
        if (disposed) return;
        // The host is as wide as the page content (no scrollbar); project into that.
        const width = host.clientWidth;
        const height = Math.max(Math.round(stripHeight), 1);
        if (width !== lastWidth || height !== lastHeight) {
          renderer.setSize(width, height, false);
          lastWidth = width;
          lastHeight = height;
        }
        camera.aspect = width / height;
        const tangent = Math.tan((camera.fov * Math.PI) / 360);
        const initialDistance = Math.max(
          size.x / (2 * tangent * camera.aspect * 0.68),
          size.y / (2 * tangent * 0.68),
        );
        // A phone's screen is tall and narrow: end with its width matching the
        // page width exactly (the height runs past the viewport), so the
        // preview lands 1:1 on the real section.
        const widthFit = (baseRight - baseLeft) / (2 * tangent * camera.aspect);
        const finalDistance = phone
          ? widthFit
          : Math.min(widthFit, (top - bottom) / (2 * tangent)) * 0.98;
        const enter = smooth(progress / 0.12);
        const face = smooth((progress - 0.35) / 0.4);
        const zoom = smooth((progress - 0.7) / 0.3);
        // The corners and the camera framing share this shift, so the zoom
        // still ends exactly on the real section.
        const shift = phone ? size.x * PHONE_NUDGE * face : 0;
        const left = baseLeft + shift,
          right = baseRight + shift;
        const corners = [
          new Vector3(left, top, z),
          new Vector3(right, top, z),
          new Vector3(right, bottom, z),
          new Vector3(left, bottom, z),
        ];
        const centerScreen = new Vector3(
          (left + right) / 2,
          (top + bottom) / 2,
          z,
        );
        stage.position.y = -(1 - enter) * initialDistance * tangent * 2.1;
        stage.rotation.x = (1 - face) * (Math.PI / 2 - 0.035);
        stage.rotation.z = (1 - enter) * 0.04;
        const distance =
          initialDistance * Math.pow(finalDistance / initialDistance, zoom);
        // End with the screen's top-left at the viewport origin, so the
        // static section preview and the native section share the same crop.
        const finalTarget = new Vector3(
          left + finalDistance * tangent * camera.aspect,
          top - finalDistance * tangent,
          centerScreen.z,
        );
        const gaze = centerScreen.clone().lerp(finalTarget, zoom);
        camera.position.copy(gaze).add(new Vector3(0, 0, distance));
        camera.lookAt(gaze);
        camera.updateProjectionMatrix();
        stage.updateMatrixWorld(true);
        renderer.render(scene, camera);
        const projected = corners.map((point) => {
          const p = stage.localToWorld(point.clone()).project(camera);
          return { x: ((p.x + 1) * width) / 2, y: ((1 - p.y) * height) / 2 };
        });
        portal?.update(
          [projected[0], projected[1], projected[2], projected[3]],
          progress,
          phone,
        );
      },
      hide() {
        portal?.hide();
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
