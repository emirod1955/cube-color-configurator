"use client";

import { useMemo, useEffect, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

interface WoodBaseProps {
  position?: [number, number, number];
  onReady?: (cx: number, cz: number, r: number) => void;
}

function addCylindricalUVs(geometry: THREE.BufferGeometry) {
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const cx = (box.min.x + box.max.x) / 2;
  const cz = (box.min.z + box.max.z) / 2;
  const height = box.max.y - box.min.y;

  const uvs = new Float32Array(positions.count * 2);
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) - cx;
    const z = positions.getZ(i) - cz;
    const y = positions.getY(i);
    uvs[i * 2]     = Math.atan2(z, x) / (2 * Math.PI) + 0.5;
    uvs[i * 2 + 1] = (y - box.min.y) / height;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
}

const WoodBase = ({ position = [0, 0, 0], onReady }: WoodBaseProps) => {
  const { scene } = useGLTF("/models/base.glb");
  const woodTexture = useTexture("/wood.jpg");
  const ref = useRef<THREE.Group>(null);

  const base = useMemo(() => {
    const tex = woodTexture.clone();
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    tex.needsUpdate = true;

    const cloned = clone(scene);
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry = mesh.geometry.clone();
        addCylindricalUVs(mesh.geometry);
        mesh.geometry.computeVertexNormals();
        mesh.material = new THREE.MeshLambertMaterial({
          map: tex,
          color: new THREE.Color(0.88, 0.72, 0.50),
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.isBase = true;
      }
    });
    return cloned;
  }, [scene, woodTexture]);

  useEffect(() => {
    if (!ref.current || !onReady) return;
    // Force world matrix update so Box3 gets correct world-space positions
    ref.current.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(ref.current);
    const c = new THREE.Vector3();
    const s = new THREE.Vector3();
    box.getCenter(c);
    box.getSize(s);
    // Use XZ radius (the base is a disc, largest horizontal dimension / 2)
    onReady(c.x, c.z, Math.max(s.x, s.z) / 2);
  }, [base, onReady]);

  return <primitive ref={ref} object={base} position={position} />;
};

export { WoodBase };
