"use client";

import { useGLTF } from '@react-three/drei';

interface StaticModelProps {
  path: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  receiveShadow?: boolean;
}

const StaticModel = ({ path, position = [0, 0, 0], scale = [1, 1, 1] }: StaticModelProps) => {
  const { scene } = useGLTF(path);
  return <primitive object={scene} position={position} scale={scale} />;
};

export { StaticModel };
