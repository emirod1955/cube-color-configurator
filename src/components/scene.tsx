"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Model } from "./Model";
import { WoodBase } from "./WoodBase";
import { WoodenLetters } from "./WoodenLetters";
import { BaseLights } from "./BaseLights";
import { useForm } from "./context/FormContext";

import './App.css';
import "./Scene.css";
import "./Step2/Step2.css";

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#FDFCFA" roughness={0.82} metalness={0} />
    </mesh>
  );
}



function CameraSetup({ woodText }: { woodText: string }) {
  const { camera } = useThree();

  useEffect(() => {
    const numLetters = Math.min(Math.max(woodText.trim().length, 1), 15);
    const angleStep = THREE.MathUtils.degToRad(24);
    const midAngle = Math.PI / 2 - ((numLetters - 1) / 2) * angleStep;
    // Place camera outside the letter arc in the direction letters face
    camera.position.set(
      38 * Math.cos(midAngle),
      12,
      38 * Math.sin(midAngle)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}




const BASE_POSITION: [number, number, number] = [1.5, -2, -4.5];

function ScreenshotCapturer({ captureRef }: { captureRef: React.MutableRefObject<(() => string) | null> }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    captureRef.current = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    };
    return () => { captureRef.current = null; };
  }, [gl, scene, camera, captureRef]);
  return null;
}

function Scene() {
  const {
    persons,
    setPersons,
    woodText,
    handleGenderChange,
    handleSizeChange,
    dragBounds,
    handleBoundsReady,
    setScreenshotUrl,
    nextStep,
  } = useForm();

  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [selectedPersonIndex, setSelectedPersonIndex] = useState(0);
  const [isNight, setIsNight] = useState(false);

  const captureRef = useRef<(() => string) | null>(null);

  const handleNext = useCallback(() => {
    const url = captureRef.current?.();
    if (url) setScreenshotUrl(url);
    nextStep();
  }, [setScreenshotUrl, nextStep]);

  const personPositionsRef = useRef<([number, number, number] | undefined)[]>([]);
  const personSizesRef = useRef<(number | undefined)[]>([]);
  // Lock selection changes while any person is being dragged
  const isDraggingAnyRef = useRef(false);

  const letterPositions = useMemo(() => {
    const count = Math.min(woodText.length, 15);
    const radius = 5;
    const angleStep = THREE.MathUtils.degToRad(24);
    return Array.from({ length: count }, (_, i) => {
      const angle = Math.PI / 2 - i * angleStep;
      return { x: radius * Math.cos(angle), z: radius * Math.sin(angle) };
    });
  }, [woodText]);

  const handleDragStart = () => {
    setControlsEnabled(false);
    isDraggingAnyRef.current = true;
  };
  const handleDragEnd = (index: number) => {
    setControlsEnabled(true);
    isDraggingAnyRef.current = false;
    setSelectedPersonIndex(index);
  };


  return (
    <div className="step2" style={{ position: "relative" }}>
      <button className={`night-toggle-btn${isNight ? " night-toggle-btn--night" : ""}`} onClick={() => setIsNight(n => !n)}>
        {isNight ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
        {isNight ? "Día" : "Noche"}
      </button>

      <div className="step2canvas">
        <Canvas
          id="sceneCanva"
          camera={{ position: [40, 40, 40], fov: 30 }}
          gl={{ preserveDrawingBuffer: true }}
          shadows
        >
          <color attach="background" args={[isNight ? "#080808" : "#F4F2EE"]} />
          <fog attach="fog" args={[isNight ? "#080808" : "#F4F2EE", 80, 180]} />
          <ScreenshotCapturer captureRef={captureRef} />
          <CameraSetup woodText={woodText} />
          <hemisphereLight args={["#FFF6EC", "#C8B49A", isNight ? 0.15 : 1.1]} />
          <directionalLight
            position={[-5, 16, 10]}
            intensity={isNight ? 0 : 1.6}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.1}
            shadow-camera-far={120}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
            shadow-bias={0}
            shadow-normalBias={0.05}
          />
          <directionalLight position={[12, 6, -4]} intensity={isNight ? 0 : 0.45} />
          <WoodBase position={BASE_POSITION} onReady={handleBoundsReady} />
          {dragBounds && (
            <BaseLights cx={dragBounds.cx} cz={dragBounds.cz} radius={dragBounds.r} />
          )}
          <Floor />

          {persons.map((person, i) => (
            <Model
              key={i}
              personIndex={i}
              personPositionsRef={personPositionsRef}
              personSizesRef={personSizesRef}
              isDraggingAnyRef={isDraggingAnyRef}
              position={person.position}
              color={person.color}
              size={person.size}
              gender={person.gender}
              dragBounds={dragBounds}
              letterPositions={letterPositions}
              isSelected={selectedPersonIndex === i}
              onClick={() => { if (!isDraggingAnyRef.current) setSelectedPersonIndex(i); }}
              onDragStart={handleDragStart}
              onDragEnd={() => handleDragEnd(i)}
            />
          ))}
          <WoodenLetters woodText={woodText} />
          <OrbitControls enabled={controlsEnabled} maxPolarAngle={Math.PI / 2 - 0.05} maxDistance={80} minDistance={20} />
        </Canvas>
      </div>

      <div className="inputsSide">
        {selectedPersonIndex !== null && (
          <div className="inputsSideContent">
            <h2>Persona Seleccionada</h2>

            <div className="inputsSideContent-gender">
              <label htmlFor="options">Genero</label>
              <select
                id="options"
                className="custom-dropdown"
                value={persons[selectedPersonIndex].gender}
                onChange={(e) => handleGenderChange(selectedPersonIndex, e.target.value as "man" | "woman")}
              >
                <option value="man">Masculino</option>
                <option value="woman">Femenino</option>
              </select>
            </div>

            <div className="inputsSideContent-color">
              <label>Color</label>
              <div className="color-swatches">
                {[
                  '#F5F5F5', '#222222', '#E63946', '#F4A261',
                  '#2A9D8F', '#457B9D', '#6A0572', '#F1C40F',
                  '#8B4513', '#A8D8EA',
                ].map((c) => (
                  <button
                    key={c}
                    className={`color-swatch${persons[selectedPersonIndex].color === c ? ' selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() =>
                      setPersons((prev) => {
                        const updated = [...prev];
                        updated[selectedPersonIndex] = { ...updated[selectedPersonIndex], color: c };
                        return updated;
                      })
                    }
                  />
                ))}
              </div>
            </div>

            <div className="inputsSideContent-size">
              <label>Tamaño</label>
              <div>
                {([0.8, 1, 1.2] as const).map((s, i) => (
                  <button
                    key={s}
                    onClick={() => handleSizeChange(selectedPersonIndex, s)}
                    style={{
                      backgroundColor: persons[selectedPersonIndex].size === s ? "#333" : "#fff",
                      color: persons[selectedPersonIndex].size === s ? "#fff" : "#000",
                    }}
                  >
                    {(["S", "M", "L"] as const)[i]}
                  </button>
                ))}
              </div>
            </div>
            <div className="sceneNavButtons">
              <button className="navNext" onClick={handleNext}>Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { Scene };
