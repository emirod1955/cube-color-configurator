"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Model } from "./Model";
import { WoodBase } from "./WoodBase";
import { WoodenLetters } from "./WoodenLetters";
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
    <div className="step2">
      <div className="step2canvas">
        <Canvas
          id="sceneCanva"
          camera={{ position: [40, 40, 40], fov: 30 }}
          gl={{ preserveDrawingBuffer: true }}
          shadows
        >
          <color attach="background" args={["#F4F2EE"]} />
          <fog attach="fog" args={["#F4F2EE", 80, 180]} />
          <ScreenshotCapturer captureRef={captureRef} />
          <CameraSetup woodText={woodText} />
          {/* Sky warm / ground warm-muted — gives gradiente natural de iluminacion */}
          <hemisphereLight args={["#FFF6EC", "#C8B49A", 1.1]} />
          {/* Luz principal con sombras */}
          <directionalLight
            position={[-5, 16, 10]}
            intensity={1.6}
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
          {/* Fill suave desde la derecha */}
          <directionalLight position={[12, 6, -4]} intensity={0.45} />
          <WoodBase position={BASE_POSITION} onReady={handleBoundsReady} />
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
