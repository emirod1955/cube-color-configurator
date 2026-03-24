"use client";

import { useMemo, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { WoodBase } from "../WoodBase";
import { WoodenLetters } from "../WoodenLetters";
import { BaseLights } from "../BaseLights";
import { GlassDome } from "../GlassDome";
import { PetModel, PetTypeId } from "../Pet/PetModel";
import { Person, PetConfig } from "../context/FormContext";
import "../Scene.css";

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

function PreviewPet({ pet, woodText }: { pet: PetConfig; woodText: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const { letterCenterX, letterCenterZ } = useMemo(() => {
    const n = Math.min(Math.max(woodText.trim().length, 1), 9);
    const step = THREE.MathUtils.degToRad(24);
    let cx = 0, cz = 0;
    for (let i = 0; i < n; i++) {
      const angle = Math.PI / 2 - i * step;
      cx += 5 * Math.cos(angle);
      cz += 5 * Math.sin(angle);
    }
    return { letterCenterX: cx / n, letterCenterZ: cz / n };
  }, [woodText]);

  useFrame(() => {
    if (groupRef.current) {
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      groupRef.current.lookAt(letterCenterX, worldPos.y, letterCenterZ);
    }
  });

  return (
    <group ref={groupRef} position={pet.position as [number, number, number]}>
      <PetModel type={pet.type as PetTypeId} color={pet.color} position={[0, 0, 0]} />
    </group>
  );
}

interface ConfirmationPreviewProps {
  persons: Person[];
  woodText: string;
  pets: PetConfig[];
}

export function ConfirmationPreview({ persons, woodText, pets }: ConfirmationPreviewProps) {
  const [bounds, setBounds] = useState<{ cx: number; cz: number; r: number } | null>(null);
  const [isNight, setIsNight] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <button
        className={`night-toggle-btn${isNight ? " night-toggle-btn--night" : ""}`}
        onClick={() => setIsNight(n => !n)}
      >
        {isNight ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
        {isNight ? "Día" : "Noche"}
      </button>

      <Canvas
        shadows
        camera={{ position: [25, 15, 18], fov: 35 }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={[isNight ? "#080808" : "#ECEAE6"]} />
        <fog attach="fog" args={[isNight ? "#080808" : "#ECEAE6", 80, 180]} />

        <hemisphereLight args={["#FFF6EC", "#C8B49A", isNight ? 0.55 : 1.1]} />
        <directionalLight
          position={[-5, 16, 10]}
          intensity={isNight ? 0 : 1.6}
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
        <directionalLight position={[12, 6, -4]} intensity={isNight ? 0 : 0.45} />

        <WoodBase position={BASE_POSITION} onReady={(cx, cz, r) => setBounds({ cx, cz, r })} />
        <WoodenLetters woodText={woodText} />
        {bounds && <BaseLights cx={bounds.cx} cz={bounds.cz} radius={bounds.r} />}
        {bounds && <GlassDome cx={bounds.cx} cz={bounds.cz} radius={bounds.r} />}
        {pets.map((pet, i) => (
          <PreviewPet key={i} pet={pet} woodText={woodText} />
        ))}

        {persons.map((person, i) => (
          <PreviewPerson key={i} person={person} />
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#FDFCFA" roughness={0.82} metalness={0} />
        </mesh>

        <OrbitControls
          target={bounds ? [bounds.cx, 4, bounds.cz] : [0, 4, 0]}
          autoRotate
          autoRotateSpeed={2.5}
          maxPolarAngle={Math.PI / 2 - 0.05}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
