import * as THREE from "three";

export const ensureUVs = (geometry: THREE.BufferGeometry): void => {
  if (!geometry || geometry.attributes.uv) return;

  geometry.computeBoundingBox();
  geometry.computeVertexNormals();

  const { min, max } = geometry.boundingBox!;
  const size = new THREE.Vector3().subVectors(max, min);
  const posAttr = geometry.attributes.position;
  const normalAttr = geometry.attributes.normal;

  const uvs: number[] = [];
  const pos = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const absNormal = new THREE.Vector3();

  for (let i = 0; i < posAttr.count; i++) {
    pos.fromBufferAttribute(posAttr, i).sub(min);
    normal.fromBufferAttribute(normalAttr, i);
    absNormal.set(Math.abs(normal.x), Math.abs(normal.y), Math.abs(normal.z));

    let u = 0;
    let v = 0;
    if (absNormal.x >= absNormal.y && absNormal.x >= absNormal.z) {
      u = pos.z / Math.max(size.z, 1e-5);
      v = pos.y / Math.max(size.y, 1e-5);
    } else if (absNormal.y >= absNormal.x && absNormal.y >= absNormal.z) {
      u = pos.x / Math.max(size.x, 1e-5);
      v = pos.z / Math.max(size.z, 1e-5);
    } else {
      u = pos.x / Math.max(size.x, 1e-5);
      v = pos.y / Math.max(size.y, 1e-5);
    }

    uvs.push(u, v);
  }

  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  (geometry.attributes.uv as THREE.BufferAttribute).needsUpdate = true;
};
