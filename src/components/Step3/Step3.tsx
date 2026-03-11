"use client";

import React from "react";
import StepNavigation from "../stepNav/stepNavigation";
import { StaticModel } from "../StaticModel";
import { WoodenLetters } from "../WoodenLetters";
import { Center, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useForm } from "../context/FormContext";
import "./Step3.css";

const Step3 = () => {
  const { woodText, setWoodText } = useForm();

  const handleWoodTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWoodText(e.target.value.toUpperCase());
  };

  return (
    <div className="Step3">
      <div style={{ flex: 1, background: '#F4F2EE', height: '100vh' }}>
      <Canvas camera={{ position: [30, 15, 30], fov: 30 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <Center>
          <StaticModel path="/models/base.glb" position={[1.5, -2, -4.5]} />
          <WoodenLetters woodText={woodText} />
        </Center>
        <OrbitControls />
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
            maxLength={13}
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
