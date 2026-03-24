"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useGesture } from "@use-gesture/react";
import { useSpring, a } from "@react-spring/three";
import { Model } from "./Model";
import { WoodBase } from "./WoodBase";
import { WoodenLetters } from "./WoodenLetters";
import { BaseLights, LED_RADIUS_FACTOR } from "./BaseLights";
import { PetModel, PET_TYPES, PetTypeId, PET_SCALE } from "./Pet/PetModel";
import { useForm, PetConfig } from "./context/FormContext";

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
    const numLetters = Math.min(Math.max(woodText.trim().length, 1), 9);
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

const _raycaster = new THREE.Raycaster();
const _plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
const _intersection = new THREE.Vector3();
const _tmpVec = new THREE.Vector3();

const MAX_PETS = 4;

function DraggablePetModel({
  pet,
  petIndex,
  setPets,
  dragBounds,
  woodText,
  personPositionsRef,
  personSizesRef,
  petPositionsRef,
  onDragStart,
  onDragEnd,
}: {
  pet: PetConfig;
  petIndex: number;
  setPets: React.Dispatch<React.SetStateAction<PetConfig[]>>;
  dragBounds?: { cx: number; cz: number; r: number };
  woodText: string;
  personPositionsRef: React.MutableRefObject<([number, number, number] | undefined)[]>;
  personSizesRef: React.MutableRefObject<(number | undefined)[]>;
  petPositionsRef: React.MutableRefObject<([number, number, number] | null)[]>;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  // Compute the geometric center of the letters arc in world XZ
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

  const { camera, gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const facingGroupRef = useRef<THREE.Group>(null);
  const isDraggingRef = useRef(false);
  const postDragFramesRef = useRef(0);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const offset = useRef<[number, number, number]>([0, 0, 0]);

  const dragThreshold = 5;

  const [spring, setSpring] = useSpring(() => ({
    position: pet.position as [number, number, number],
    config: { friction: 10 },
  }));

  useEffect(() => {
    if (!isDraggingRef.current) {
      setSpring({ position: pet.position as [number, number, number], immediate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.position[0], pet.position[1], pet.position[2]]);

  const getPlanePos = (clientX: number, clientY: number) => {
    const ndcX = (clientX / gl.domElement.clientWidth) * 2 - 1;
    const ndcY = -(clientY / gl.domElement.clientHeight) * 2 + 1;
    _raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    _plane.constant = spring.position.get()[1];
    _raycaster.ray.intersectPlane(_plane, _intersection);
    return { x: _intersection.x, z: _intersection.z };
  };

  const FOOT_X = -4.5;
  const FOOT_Z = 2.0;

  const clamp = (x: number, z: number) => {
    let px = x, pz = z;

    // Repel from persons
    for (let i = 0; i < personPositionsRef.current.length; i++) {
      const other = personPositionsRef.current[i];
      if (!other) continue;
      const personSize = personSizesRef.current[i] ?? 1.0;
      const footX = other[0] + FOOT_X;
      const footZ = other[2] + FOOT_Z;
      const minDist = PET_SCALE * 0.9 + personSize * 1.1;
      const ddx = px - footX;
      const ddz = pz - footZ;
      const d = Math.sqrt(ddx * ddx + ddz * ddz);
      if (d < minDist) {
        if (d < 0.001) {
          px += minDist;
        } else {
          px = footX + (ddx / d) * minDist;
          pz = footZ + (ddz / d) * minDist;
        }
      }
    }

    // Repel from other pets
    for (let i = 0; i < petPositionsRef.current.length; i++) {
      if (i === petIndex) continue;
      const other = petPositionsRef.current[i];
      if (!other) continue;
      const minDist = PET_SCALE * 1.8;
      const ddx = px - other[0];
      const ddz = pz - other[2];
      const d = Math.sqrt(ddx * ddx + ddz * ddz);
      if (d < minDist) {
        if (d < 0.001) {
          px += minDist;
        } else {
          px = other[0] + (ddx / d) * minDist;
          pz = other[2] + (ddz / d) * minDist;
        }
      }
    }

    // Clamp to LED circle
    if (dragBounds) {
      const dx = px - dragBounds.cx;
      const dz = pz - dragBounds.cz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const maxR = dragBounds.r * LED_RADIUS_FACTOR - PET_SCALE * 1.0;
      if (dist > maxR) {
        px = dragBounds.cx + (dx / dist) * maxR;
        pz = dragBounds.cz + (dz / dist) * maxR;
      }
    }

    return { x: px, z: pz };
  };

  // Cleanup: clear this pet's slot when unmounted
  useEffect(() => {
    return () => { petPositionsRef.current[petIndex] = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petIndex]);

  useFrame(() => {
    // Always publish this pet's position so persons and other pets can repel from it
    const [px, py, pz] = spring.position.get();
    petPositionsRef.current[petIndex] = [px, py, pz];

    // Always make the pet face the letters center
    if (facingGroupRef.current) {
      facingGroupRef.current.getWorldPosition(_tmpVec);
      facingGroupRef.current.lookAt(letterCenterX, _tmpVec.y, letterCenterZ);
    }
    // Clamp while dragging AND for post-drag frames (mirrors Model behaviour)
    if (!isDraggingRef.current) {
      if (postDragFramesRef.current <= 0) return;
      postDragFramesRef.current--;
    }
    if (!groupRef.current) return;
    const [x, , z] = spring.position.get();
    const c = clamp(x, z);
    if (Math.abs(c.x - x) > 0.001 || Math.abs(c.z - z) > 0.001) {
      groupRef.current.position.x = c.x;
      groupRef.current.position.z = c.z;
      spring.position.set([c.x, spring.position.get()[1], c.z]);
    }
  });

  const bind = useGesture({
    onDragStart: ({ event }) => {
      const e = event as MouseEvent;
      const pos = getPlanePos(e.clientX, e.clientY);
      const cur = spring.position.get();
      offset.current = [cur[0] - pos.x, 0, cur[2] - pos.z];
      startPosition.current = { x: e.clientX, y: e.clientY };
      isDraggingRef.current = false;
      onDragStart();
    },
    onDrag: ({ xy: [x, y] }) => {
      if (!startPosition.current) return;
      if (Math.abs(x - startPosition.current.x) > dragThreshold || Math.abs(y - startPosition.current.y) > dragThreshold) {
        isDraggingRef.current = true;
        const pos = getPlanePos(x, y);
        const c = clamp(pos.x + offset.current[0], pos.z + offset.current[2]);

        // Block if clamped position still overlaps a person or another pet
        let blocked = false;
        for (let i = 0; i < personPositionsRef.current.length; i++) {
          const other = personPositionsRef.current[i];
          if (!other) continue;
          const personSize = personSizesRef.current[i] ?? 1.0;
          const minDist = PET_SCALE * 0.9 + personSize * 1.1;
          const dx = c.x - (other[0] + FOOT_X);
          const dz = c.z - (other[2] + FOOT_Z);
          if (Math.sqrt(dx * dx + dz * dz) < minDist - 0.01) {
            blocked = true;
            break;
          }
        }
        if (!blocked) {
          for (let i = 0; i < petPositionsRef.current.length; i++) {
            if (i === petIndex) continue;
            const other = petPositionsRef.current[i];
            if (!other) continue;
            const minDist = PET_SCALE * 1.8;
            const dx = c.x - other[0];
            const dz = c.z - other[2];
            if (Math.sqrt(dx * dx + dz * dz) < minDist - 0.01) {
              blocked = true;
              break;
            }
          }
        }

        if (!blocked) {
          setSpring({ position: [c.x, spring.position.get()[1], c.z], immediate: true });
        }
      }
    },
    onDragEnd: () => {
      const [x, y, z] = spring.position.get();
      const c = clamp(x, z);
      setSpring({ position: [c.x, y, c.z], immediate: true });
      postDragFramesRef.current = 30;
      isDraggingRef.current = false;
      startPosition.current = null;
      setPets(prev => prev.map((p, i) => i === petIndex ? { ...p, position: [c.x, y, c.z] } : p));
      onDragEnd();
    },
  });

  return (
    <a.group ref={groupRef} position={spring.position} {...(bind() as object)}>
      <group ref={facingGroupRef}>
        <PetModel type={pet.type as PetTypeId} color={pet.color} position={[0, 0, 0]} />
      </group>
    </a.group>
  );
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
    pets,
    setPets,
  } = useForm();

  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [selectedPersonIndex, setSelectedPersonIndex] = useState(0);
  const [selectedPetIndex, setSelectedPetIndex] = useState<number | null>(null);
  const [isNight, setIsNight] = useState(false);

  const captureRef = useRef<(() => string) | null>(null);

  const handleNext = useCallback(() => {
    const url = captureRef.current?.();
    if (url) setScreenshotUrl(url);
    nextStep();
  }, [setScreenshotUrl, nextStep]);

  const personPositionsRef = useRef<([number, number, number] | undefined)[]>([]);
  const personSizesRef = useRef<(number | undefined)[]>([]);
  const petPositionsRef = useRef<([number, number, number] | null)[]>([]);

  // Keep petPositionsRef length in sync with pets array
  useEffect(() => {
    petPositionsRef.current = pets.map((_, i) => petPositionsRef.current[i] ?? null);
  }, [pets.length]);
  // Lock selection changes while any person is being dragged
  const isDraggingAnyRef = useRef(false);

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
          <hemisphereLight args={["#FFF6EC", "#C8B49A", isNight ? 0.55 : 1.1]} />
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
              petPositionsRef={petPositionsRef}
              isDraggingAnyRef={isDraggingAnyRef}
              position={person.position}
              color={person.color}
              size={person.size}
              gender={person.gender}
              dragBounds={dragBounds}

              isSelected={selectedPersonIndex === i}
              onClick={() => { if (!isDraggingAnyRef.current) setSelectedPersonIndex(i); }}
              onDragStart={handleDragStart}
              onDragEnd={() => handleDragEnd(i)}
            />
          ))}
          <WoodenLetters woodText={woodText} />
          {pets.map((pet, i) => (
            <DraggablePetModel
              key={i}
              pet={pet}
              petIndex={i}
              setPets={setPets}
              dragBounds={dragBounds}
              woodText={woodText}
              personPositionsRef={personPositionsRef}
              personSizesRef={personSizesRef}
              petPositionsRef={petPositionsRef}
              onDragStart={handleDragStart}
              onDragEnd={() => setControlsEnabled(true)}
            />
          ))}
          <OrbitControls target={dragBounds ? [dragBounds.cx, 3, dragBounds.cz] : [0, 3, 0]} enabled={controlsEnabled} maxPolarAngle={Math.PI / 2 - 0.05} maxDistance={80} minDistance={20} />
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
                  '#8B4513', '#A8D8EA', '#F4A7B9', '#9E9E9E',
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

        {/* ── Mascotas ── */}
        <div className="pet-section">
          <div className="pet-section__header">
            <label className="pet-section__label">Mascotas</label>
            {pets.length < MAX_PETS && (
              <button
                className="pet-add-btn"
                onClick={() => {
                  const newIndex = pets.length;
                  setPets(prev => [...prev, { type: "perro", color: PET_TYPES[0].color, position: [0, 0, 3 + newIndex * 2.5] }]);
                  setSelectedPetIndex(newIndex);
                }}
              >
                + Agregar
              </button>
            )}
          </div>

          {pets.length > 0 && (
            <div className="pet-chips">
              {pets.map((p, i) => (
                <button
                  key={i}
                  className={`pet-chip${selectedPetIndex === i ? ' selected' : ''}`}
                  onClick={() => setSelectedPetIndex(selectedPetIndex === i ? null : i)}
                >
                  {PET_TYPES.find(t => t.id === p.type)?.emoji ?? '🐾'}
                </button>
              ))}
            </div>
          )}

          {selectedPetIndex !== null && pets[selectedPetIndex] && (() => {
            const selPet = pets[selectedPetIndex];
            const idx = selectedPetIndex;
            return (
              <>
                <div className="pet-type-grid">
                  {PET_TYPES.map(pt => (
                    <button
                      key={pt.id}
                      className={`pet-type-btn${selPet.type === pt.id ? ' selected' : ''}`}
                      onClick={() => setPets(prev => prev.map((p, i) => i === idx ? { ...p, type: pt.id, color: pt.color } : p))}
                    >
                      <span className="pet-type-emoji">{pt.emoji}</span>
                      <span className="pet-type-label">{pt.label}</span>
                    </button>
                  ))}
                </div>
                <div className="pet-photo-upload">
                  <label className="pet-photo-label" htmlFor={`pet-photo-input-${idx}`}>
                    📷 {selPet.photo ? "Cambiar foto" : "Subir foto"}
                  </label>
                  <input
                    id={`pet-photo-input-${idx}`}
                    type="file"
                    accept="image/*"
                    className="pet-photo-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const base64 = ev.target?.result as string;
                        setPets(prev => prev.map((p, i) => i === idx ? { ...p, photo: base64 } : p));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {selPet.photo && (
                    <img src={selPet.photo} alt="Mascota" className="pet-photo-preview" />
                  )}
                </div>
                <button
                  className="pet-remove-btn"
                  onClick={() => {
                    setPets(prev => prev.filter((_, i) => i !== idx));
                    setSelectedPetIndex(null);
                  }}
                >
                  Quitar mascota
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export { Scene };
