"use client";

import React, { useState } from "react";
import StepNavigation from "../stepNav/stepNavigation";
import { WoodBase } from "../WoodBase";
import { WoodenLetters } from "../WoodenLetters";
import { BaseLights } from "../BaseLights";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useForm } from "../context/FormContext";
import "./Step3.css";

const Step3 = () => {
  const { woodText, setWoodText } = useForm();
  const [bounds, setBounds] = useState<{ cx: number; cz: number; r: number } | null>(null);

  const handleWoodTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWoodText(e.target.value.toUpperCase());
  };

  return (
    <div className="Step3">
      <div style={{ flex: 1, background: '#F4F2EE', height: '100vh' }}>
      <Canvas shadows camera={{ position: [35, 16, 20], fov: 30 }}>
        <color attach="background" args={["#F4F2EE"]} />
        <fog attach="fog" args={["#F4F2EE", 80, 180]} />
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
        <WoodBase position={[1.5, -2, -4.5]} onReady={(cx, cz, r) => setBounds({ cx, cz, r })} />
        <WoodenLetters woodText={woodText} />
        {bounds && <BaseLights cx={bounds.cx} cz={bounds.cz} radius={bounds.r} />}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#FDFCFA" roughness={0.82} metalness={0} />
        </mesh>
        <OrbitControls maxPolarAngle={Math.PI / 2 - 0.05} maxDistance={80} minDistance={20} />
      </Canvas>
      </div>
      <div className="rightSide">
        <div className="step3InputSide">
          <div className="title">
            <h1>PALABRA EN MADERA</h1>
            <p>¿Qué palabra especial quieres en el frente de tu cúpula? Escríbela aquí.</p>
          </div>
          <input
            type="text"
            value={woodText}
            onChange={handleWoodTextChange}
            placeholder="Enter text"
            maxLength={15}
          />
          <div className="step3NavButtons">
            <StepNavigation />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Step3 };
