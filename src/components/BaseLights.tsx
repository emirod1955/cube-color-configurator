"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface BaseLightsProps {
  cx: number;
  cz: number;
  radius: number;
  y?: number;
}

export const LED_RADIUS_FACTOR = 0.63;

const BaseLights = ({ cx, cz, radius, y = 0.0 }: BaseLightsProps) => {
  const COUNT = 8;
  const LED_RADIUS = radius * LED_RADIUS_FACTOR;

  const positions = useMemo<[number, number, number][]>(() =>
    Array.from({ length: COUNT }, (_, i) => {
      const angle = (i / COUNT) * Math.PI * 2;
      return [
        cx + LED_RADIUS * Math.cos(angle),
        y,
        cz + LED_RADIUS * Math.sin(angle),
      ];
    }),
    [cx, cz, LED_RADIUS, y]
  );

  const cableGeometry = useMemo(() => {
    const points = Array.from({ length: 65 }, (_, i) => {
      const angle = (i / 64) * Math.PI * 2;
      return new THREE.Vector3(
        cx + LED_RADIUS * Math.cos(angle),
        y,
        cz + LED_RADIUS * Math.sin(angle),
      );
    });
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 128, 0.04, 6, true);
  }, [cx, cz, LED_RADIUS, y]);

  return (
    <>
      {/* Cable */}
      <mesh geometry={cableGeometry}>
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.1} transparent opacity={0.25} />
      </mesh>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial
              color="#FFE580"
              emissive={new THREE.Color("#FFD060")}
              emissiveIntensity={5}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            color="#FFB830"
            intensity={8}
            distance={16}
            decay={2}
          />
        </group>
      ))}
    </>
  );
};

export { BaseLights };
