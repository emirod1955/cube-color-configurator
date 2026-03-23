"use client";

import * as THREE from "three";

interface GlassDomeProps {
  cx: number;
  cz: number;
  radius: number;
}

export function GlassDome({ cx, cz, radius }: GlassDomeProps) {
  const r = radius * 0.82;
  const cylinderHeight = 10;
  const capHeight = 4.3;

  return (
    <group position={[cx, -1.5, cz]}>
      {/* Sección recta cilíndrica */}
      <mesh position={[0, cylinderHeight / 2, 0]}>
        <cylinderGeometry args={[r, r, cylinderHeight, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#d8eeff"
          transparent
          opacity={0.22}
          roughness={0.04}
          metalness={0.05}
          transmission={0.82}
          thickness={1.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Cúpula elipsoidal superior */}
      <mesh position={[0, cylinderHeight, 0]} scale={[1, capHeight / r, 1]}>
        <sphereGeometry args={[r, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#d8eeff"
          transparent
          opacity={0.22}
          roughness={0.04}
          metalness={0.05}
          transmission={0.82}
          thickness={1.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
