// StaticModel.jsx
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

const StaticModel = ({ path, position = [0, 0, 0], scale = [1, 1, 1] }) => {
  const group = useRef();
  const { scene } = useGLTF(path);
  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  );
};

export  {StaticModel};
