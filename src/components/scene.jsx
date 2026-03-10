import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Model } from "./Model";
import { StaticModel } from "./StaticModel";
import { WoodenLetters } from "./WoodenLetters";

import { useForm } from "./context/FormContext";

import './App.css';
import "./Scene.css";

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

  const handleDragStart = () => setControlsEnabled(false);
  const handleDragEnd = (index) => {
    setControlsEnabled(true);
    setSelectedPersonIndex(index);
  };

  return (
    <div className="step2">
      <div className="step2canvas">
        <Canvas
          id="sceneCanva"
          shadows
          camera={{ position: [40, 40, 40], fov: 30 }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={1}
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
          />
          <StaticModel path="/models/base.glb" position={[1.5, -2, -4.5]} receiveShadow />
          {persons.map((person, i) => (
            <Model
              key={i}
              position={person.position}
              color={person.color}
              size={person.size}
              gender={person.gender}
              onClick={() => setSelectedPersonIndex(i)}
              onDragStart={handleDragStart}
              onDragEnd={() => handleDragEnd(i)}
              castShadow
              receiveShadow
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
                onChange={(e) => handleGenderChange(selectedPersonIndex, e.target.value)}
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
                {[0.8, 1, 1.2].map((s, i) => (
                  <button
                    key={s}
                    onClick={() => handleSizeChange(selectedPersonIndex, s)}
                    style={{
                      backgroundColor: persons[selectedPersonIndex].size === s ? "#333" : "#fff",
                      color: persons[selectedPersonIndex].size === s ? "#fff" : "#000",
                    }}
                  >
                    {["S", "M", "L"][i]}
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
