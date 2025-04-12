import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Model } from "./Model";
import { StaticModel } from "./StaticModel";

import './App.css';

function Scene() {
  const [numPersons, setNumPersons] = useState(1);
  const [persons, setPersons] = useState([
    { color: "#ffffff", size: 1, position: [0, 0, 0], name: "Emiliano", gender: "man" },
  ]);
  const [selectedPersonIndex, setSelectedPersonIndex] = useState(null);

  const regeneratePositions = () => {
    setPersons((prevPersons) =>
      prevPersons.map((person, index) => ({
        ...person,
        position: getPosition(index),
      }))
    );
  };

  const handleNumPersonsChange = (e) => {
    const value = Math.max(1, Math.min(9, parseInt(e.target.value, 10) || 1));
    setNumPersons(value);
  
    setPersons((prevPersons) => {
      const newPersons = [];
      for (let i = 0; i < value; i++) {
        newPersons.push(
          prevPersons[i]
            ? { ...prevPersons[i] } // Keep existing person with its position
            : {
                color: "#ffffff",
                size: 1,
                position: getPosition(i), // Assign a position only to new persons
                name: `Person ${i + 1}`,
                gender: "man",
              }
        );
      }
      return newPersons;
    });
  };

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
  const getPosition = (index) => {
    const gridSize = 3; // Fixed number of columns in the grid
    const spacing = 3; // Base spacing between persons in the grid
    const randomOffset = () => (Math.random() - 0.5) * 1.5; // Random offset for natural spacing
  
    const row = Math.floor(index / gridSize); // Calculate the row index
    const col = index % gridSize; // Calculate the column index
  
    const x = col * spacing + randomOffset(); // Add randomness to x position
    const z = row * spacing + randomOffset(); // Add randomness to z position
    const y = 0; // Keep persons on the ground level
  
    return [x, y, z];
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      {/* 3D Scene */}
      <div style={{ flex: 2 }}>
        <Canvas camera={{ position: [40, 40, 40], fov: 30 }} style={{ width: "100%", height: "100%" }}>
          <ambientLight intensity={1} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <StaticModel path="/models/base.glb" position={[0, -2, 0]} />
          {persons.map((person, i) => (
            <Model
              key={i}
              index={i}
              position={person.position}
              color={person.color}
              size={person.size}
              name={person.name}
              gender={person.gender}
              onClick={() => setSelectedPersonIndex(i)}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
          }}
    onPointerOut={(e) => {
      e.stopPropagation();
      document.body.style.cursor = "default";
    }}
  />
))}
          <OrbitControls />
        </Canvas>
      </div>

      {/* Configuration Controls */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h2>Configure Persons</h2>
        <label>Number of Persons: </label>
        <input
          type="number"
          min="1"
          max="9"
          value={numPersons}
          onChange={handleNumPersonsChange}
          style={{ marginBottom: "20px", display: "block" }}
        />

        <button onClick={regeneratePositions} style={{ marginBottom: "20px", display: "block" }}>
          Regenerate Positions
        </button>

        {selectedPersonIndex !== null && (
          <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
            <h3>Person {selectedPersonIndex + 1}</h3>

            {/* Name control */}
            <label>Name: </label>
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
              style={{ display: "block", marginBottom: "10px" }}
            />

            {/* Gender Selection */}
            <label>Gender: </label>
            <div style={{ marginBottom: "10px" }}>
              <button
                onClick={() => handleGenderChange(selectedPersonIndex, "man")}
                style={{
                  marginRight: "10px",
                  backgroundColor: persons[selectedPersonIndex].gender === "man" ? "#007bff" : "#ccc",
                  color: "white",
                }}
              >
                Man
              </button>
              <button
                onClick={() => handleGenderChange(selectedPersonIndex, "woman")}
                style={{
                  backgroundColor: persons[selectedPersonIndex].gender === "woman" ? "#007bff" : "#ccc",
                  color: "white",
                }}
              >
                Woman
              </button>
            </div>

            {/* Color control */}
            <label>Color: </label>
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
              style={{ display: "block", marginBottom: "10px" }}
            />

            {/* Size control */}
            <label>Size: </label>
            <div>
              <button onClick={() => handleSizeChange(selectedPersonIndex, 0.8)}>Small</button>
              <button onClick={() => handleSizeChange(selectedPersonIndex, 1)}>Medium</button>
              <button onClick={() => handleSizeChange(selectedPersonIndex, 1.2)}>Large</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { Scene };