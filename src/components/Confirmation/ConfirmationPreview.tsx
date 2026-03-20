"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { useState } from "react";
import { WoodBase } from "../WoodBase";
import { WoodenLetters } from "../WoodenLetters";
import { BaseLights } from "../BaseLights";
import { Person } from "../context/FormContext";

const BASE_POSITION: [number, number, number] = [1.5, -2, -4.5];

function PreviewPerson({ person }: { person: Person }) {
  const { scene: bodyScene } = useGLTF(
    person.gender === "man" ? "/models/body_man.glb" : "/models/body_woman.glb"
  );
  const { scene: headScene } = useGLTF("/models/head.glb");

  const group = useMemo(() => {
    const body = clone(bodyScene);
    const head = clone(headScene);

    body.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
        (mesh.material as THREE.MeshStandardMaterial).color.set(person.color);
        mesh.castShadow = true;
      }
    });

    head.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
      }
    });

    const g = new THREE.Group();
    g.add(body);
    g.add(head);
    g.scale.set(person.size, person.size, person.size);
    g.position.set(-4.5 * (1 - person.size), 0, 2.0 * (1 - person.size));
    return g;
  }, [person.color, person.size, bodyScene, headScene]);

  return <primitive object={group} position={person.position} />;
}

interface ConfirmationPreviewProps {
  persons: Person[];
  woodText: string;
}

export function ConfirmationPreview({ persons, woodText }: ConfirmationPreviewProps) {
  const [bounds, setBounds] = useState<{ cx: number; cz: number; r: number } | null>(null);

  return (
    <Canvas
      shadows
      camera={{ position: [35, 16, 20], fov: 30 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#ECEAE6"]} />
      <fog attach="fog" args={["#ECEAE6", 80, 180]} />

      <hemisphereLight args={["#FFF6EC", "#C8B49A", 1.1]} />
      <directionalLight
        position={[-5, 16, 10]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={120}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-normalBias={0.05}
      />
      <directionalLight position={[12, 6, -4]} intensity={0.45} />

      <WoodBase position={BASE_POSITION} onReady={(cx, cz, r) => setBounds({ cx, cz, r })} />
      <WoodenLetters woodText={woodText} />
      {bounds && <BaseLights cx={bounds.cx} cz={bounds.cz} radius={bounds.r} />}

      {persons.map((person, i) => (
        <PreviewPerson key={i} person={person} />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#FDFCFA" roughness={0.82} metalness={0} />
      </mesh>

      <OrbitControls
        autoRotate
        autoRotateSpeed={2.5}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enableZoom={false}
        enablePan={false}
      />
    </Canvas>
  );
}
