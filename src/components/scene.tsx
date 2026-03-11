"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Model } from "./Model";
import { WoodBase } from "./WoodBase";
import { WoodenLetters } from "./WoodenLetters";
import { useForm } from "./context/FormContext";

import './App.css';
import "./Scene.css";

function ShadowLight() {
  const ref = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!ref.current) return;

    ref.current.target.position.set(0, 0, 0);
    scene.add(ref.current.target);

    const cam = ref.current.shadow.camera;
    cam.left   = -25;
    cam.right  =  25;
    cam.top    =  25;
    cam.bottom = -25;
    cam.near   =  1;
    cam.far    =  80;
    cam.updateProjectionMatrix();

    return () => {
      if (ref.current) scene.remove(ref.current.target);
    };
  }, [scene]);

  return (
    <directionalLight
      ref={ref}
      position={[10, 15, 10]}
      intensity={1}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.0005}
    />
  );
}

const BASE_POSITION: [number, number, number] = [1.5, -2, -4.5];

function Scene() {
  const {
    persons,
    setPersons,
    woodText,
    handleGenderChange,
    handleSizeChange,
  } = useForm();

  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [selectedPersonIndex, setSelectedPersonIndex] = useState(0);
  const [dragBounds, setDragBounds] = useState<{ cx: number; cz: number; r: number } | undefined>(undefined);

  const handleDragStart = () => setControlsEnabled(false);
  const handleDragEnd = (index: number) => {
    setControlsEnabled(true);
    setSelectedPersonIndex(index);
  };

  const handleBoundsReady = useCallback((cx: number, cz: number, r: number) => {
    setDragBounds({ cx, cz, r });
  }, []);

  return (
    <div className="step2">
      <div className="step2canvas" style={{ background: '#F4F2EE' }}>
        <Canvas
          id="sceneCanva"
          shadows
          camera={{ position: [40, 40, 40], fov: 30 }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <ambientLight intensity={1.5} />
          <ShadowLight />
          <WoodBase position={BASE_POSITION} onReady={handleBoundsReady} />
          {/* Transparent shadow-catching plane at base surface level */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
            <planeGeometry args={[22, 22]} />
            <shadowMaterial transparent opacity={0.35} />
          </mesh>
          {persons.map((person, i) => (
            <Model
              key={i}
              position={person.position}
              color={person.color}
              size={person.size}
              gender={person.gender}
              dragBounds={dragBounds}
              onClick={() => setSelectedPersonIndex(i)}
              onDragStart={handleDragStart}
              onDragEnd={() => handleDragEnd(i)}
            />
          ))}
          <WoodenLetters woodText={woodText} />
          <OrbitControls enabled={controlsEnabled} />
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
              <div>
                <input
                  type="color"
                  value={persons[selectedPersonIndex].color}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setPersons((prev) => {
                      const updated = [...prev];
                      updated[selectedPersonIndex] = { ...updated[selectedPersonIndex], color: newColor };
                      return updated;
                    });
                  }}
                />
                <p>{persons[selectedPersonIndex].color.slice(1).toUpperCase()}</p>
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
          </div>
        )}
      </div>
    </div>
  );
}

export { Scene };
