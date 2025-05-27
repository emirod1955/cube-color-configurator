import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei"; // Import the Text component
import { Model } from "./Model";
import { StaticModel } from "./StaticModel";

//import context
import { useForm } from "./context/FormContext";

import * as THREE from "three";


//import styles
import './App.css';
import "./Scene.css"

function Scene() {
  const {
    persons,
    setPersons,
    woodText,
    renderWoodenLetters
  } = useForm();

  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [selectedPersonIndex, setSelectedPersonIndex] = useState(0); // Add this state

  const handleGenderChange = (index, newGender) => {
    setPersons((prevPersons) => {
      const updatedPersons = [...prevPersons];
      updatedPersons[index].gender = newGender;
      return updatedPersons;
    });
  };

  const handleSizeChange = (index, newSize) => {
    setPersons((prevPersons) => {
      const updatedPersons = [...prevPersons];
      updatedPersons[index].size = newSize;
      return updatedPersons;
    });
  };

  const handleDragStart = () => {
    setControlsEnabled(false);
  };

  const handleDragEnd = (index) => {
    setControlsEnabled(true);
    setSelectedPersonIndex(index); // Update selected person index
  };

  return (
    <div className="step2">
      <div className="step2canvas">
        <Canvas
  id="sceneCanva"
  shadows // Enable shadows in the Canvas
  camera={{ position: [40, 40, 40], fov: 30 }}
>
  <ambientLight intensity={1.5} />
  <directionalLight
    position={[10, 10, 10]}
    intensity={1}
    castShadow // Enable shadows for this light
    shadow-mapSize-width={4096} // Optional: Increase shadow quality
    shadow-mapSize-height={4096}
  />
  <StaticModel
    path="/models/base.glb"
    position={[1.5, -2, -4.5]}
    receiveShadow // Ensure the static model receives shadows
  />
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
      castShadow // Ensure the model casts shadows
      receiveShadow // Ensure the model receives shadows
    />
  ))}

  {renderWoodenLetters(woodText)}
  <OrbitControls enabled={controlsEnabled} />
</Canvas>
      </div>

      <div className="inputsSide">
        {selectedPersonIndex !== null && (
          <div className="inputsSideContent">
            <h2>Persona Seleccionada</h2>
            {/* <div className="inputsSideContent-name">
              <label>Nombre</label>
              <input
                type="text"
                value={persons[selectedPersonIndex].name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setPersons((prevPersons) => {
                    const updatedPersons = [...prevPersons];
                    updatedPersons[selectedPersonIndex].name = newName;
                    return updatedPersons;
                  });
                }}
                placeholder="Enter name"
              />
            </div> */}

            <div className="inputsSideContent-gender">
              <label htmlFor="options">Genero</label>
              <select
                id="options"
                className="custom-dropdown"
                value={persons[selectedPersonIndex].gender}
                onChange={(e) =>
                  handleGenderChange(selectedPersonIndex, e.target.value)
                }
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
                    setPersons((prevPersons) => {
                      const updatedPersons = [...prevPersons];
                      updatedPersons[selectedPersonIndex].color = newColor;
                      return updatedPersons;
                    });
                  }}
                />
                <p>{persons[selectedPersonIndex].color.slice(1).toUpperCase()}</p>
              </div>
            </div>

            <div className="inputsSideContent-size">
              <label>Tamaño</label>
              <div>
                <button
                  onClick={() => handleSizeChange(selectedPersonIndex, 0.8)}
                  style={{
                    backgroundColor:
                      persons[selectedPersonIndex].size == 0.8
                        ? "#333"
                        : "#fff",
                    color:
                      persons[selectedPersonIndex].size == 0.8
                        ? "#fff"
                        : "#000",
                  }}
                >
                  S
                </button>
                <button
                  onClick={() => handleSizeChange(selectedPersonIndex, 1)}
                  style={{
                    backgroundColor:
                      persons[selectedPersonIndex].size == 1
                        ? "#333"
                        : "#fff",
                    color:
                      persons[selectedPersonIndex].size == 1
                        ? "#fff"
                        : "#000",
                  }}
                >
                  M
                </button>
                <button
                  onClick={() => handleSizeChange(selectedPersonIndex, 1.2)}
                  style={{
                    backgroundColor:
                      persons[selectedPersonIndex].size == 1.2
                        ? "#333"
                        : "#fff",
                    color:
                      persons[selectedPersonIndex].size == 1.2
                        ? "#fff"
                        : "#000"
                  }}
                >
                  L
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { Scene };