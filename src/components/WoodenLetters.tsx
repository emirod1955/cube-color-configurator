"use client";

import { useMemo } from "react";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface WoodenLettersProps {
  woodText: string;
}

const WoodenLetters = ({ woodText }: WoodenLettersProps) => {
  const woodTextureRaw = useTexture("/wood.jpg");
  const woodTexture = useMemo(() => {
    const tex = woodTextureRaw.clone();
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    tex.needsUpdate = true;
    return tex;
  }, [woodTextureRaw]);
  const maxLetters = 15;
  const letters = woodText.slice(0, maxLetters).split("");

  const radius = 5;
  const angleOffset = Math.PI / 2;
  const angleStep = THREE.MathUtils.degToRad(24);

  const letterData = useMemo(
    () =>
      letters.map((letter, index) => {
        const angle = angleOffset - index * angleStep;
        return {
          letter,
          x: radius * Math.cos(angle),
          z: radius * Math.sin(angle),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [woodText]
  );

  return letterData.map(({ letter, x, z }, index) => (
    <group
      key={index}
      position={[x, 1, z]}
      onUpdate={(self) => {
        self.lookAt(0, 1, 0);
        self.rotateY(Math.PI);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 2, 0.3]} />
        <meshLambertMaterial map={woodTexture} color={new THREE.Color(0.88, 0.72, 0.50)} />
      </mesh>
      <Text
        position={[0, 0, 0.17]}
        fontSize={1}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {letter}
      </Text>
    </group>
  ));
};

export { WoodenLetters };
