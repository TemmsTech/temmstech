import { Group, Material, Mesh, Scene, Texture } from "three";

export function disposeObject(object: Group | Scene) {
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.geometry.dispose();
    for (const material of Array.isArray(child.material)
      ? child.material
      : [child.material])
      materials.add(material);
  });
  for (const material of materials) {
    for (const value of Object.values(material))
      if (value instanceof Texture) textures.add(value);
    material.dispose();
  }
  for (const texture of textures) texture.dispose();
}
