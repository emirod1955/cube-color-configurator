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

  const [lastDraggedPersonIndex, setLastDraggedPersonIndex] = useState(null); // New state
  const [controlsEnabled, setControlsEnabled] = useState(true);

  const handleNumPersonsChange = (e) => {
    const value = Math.max(1, Math.min(9, parseInt(e.target.value, 10) || 1));
    setNumPersons(value);
  
    setPersons((prevPersons) => {
      const newPersons = [];
      for (let i = 0; i < value; i++) {
        newPersons.push(
          prevPersons[i]
            ? { ...prevPersons[i] }
            : {
                color: "#ffffff",
                size: 1,
                position: getPosition(i),
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
    const gridSize = 3;
    const spacing = 3;
    const randomOffset = () => (Math.random() - 0.5) * 1.5;
  
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
  
    const x = col * spacing + randomOffset();
    const z = row * spacing + randomOffset();
    const y = 0;
  
    return [x, y, z];
  };

  const handleDragStart = () => {
    setControlsEnabled(false);
  };

  const handleDragEnd = (index) => {
    setControlsEnabled(true);
    setLastDraggedPersonIndex(index); // Update last dragged person
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
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
              onDragStart={handleDragStart}
              onDragEnd={() => handleDragEnd(i)} // Pass index to handler
            />
          ))}
          <OrbitControls enabled={controlsEnabled} />
        </Canvas>
      </div>

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

        {lastDraggedPersonIndex !== null && (
          <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
            <h3>Last Dragged Person</h3>
            <label>Name: </label>
            <input
              type="text"
              value={persons[lastDraggedPersonIndex].name}
              onChange={(e) => {
                const newName = e.target.value;
                setPersons((prevPersons) => {
                  const updatedPersons = [...prevPersons];
                  updatedPersons[lastDraggedPersonIndex].name = newName;
                  return updatedPersons;
                });
              }}
              placeholder="Enter name"
              style={{ display: "block", marginBottom: "10px" }}
            />

            <label>Gender: </label>
            <div style={{ marginBottom: "10px" }}>
              <button
                onClick={() => handleGenderChange(lastDraggedPersonIndex, "man")}
                style={{
                  marginRight: "10px",
                  backgroundColor: persons[lastDraggedPersonIndex].gender === "man" ? "#007bff" : "#ccc",
                  color: "white",
                }}
              >
                Man
              </button>
              <button
                onClick={() => handleGenderChange(lastDraggedPersonIndex, "woman")}
                style={{
                  backgroundColor: persons[lastDraggedPersonIndex].gender === "woman" ? "#007bff" : "#ccc",
                  color: "white",
                }}
              >
                Woman
              </button>
            </div>

            <label>Color: </label>
            <input
              type="color"
              value={persons[lastDraggedPersonIndex].color}
              onChange={(e) => {
                const newColor = e.target.value;
                setPersons((prevPersons) => {
                  const updatedPersons = [...prevPersons];
                  updatedPersons[lastDraggedPersonIndex].color = newColor;
                  return updatedPersons;
                });
              }}
              style={{ display: "block", marginBottom: "10px" }}
            />

            <label>Size: </label>
            <div>
              <button onClick={() => handleSizeChange(lastDraggedPersonIndex, 0.8)}>Small</button>
              <button onClick={() => handleSizeChange(lastDraggedPersonIndex, 1)}>Medium</button>
              <button onClick={() => handleSizeChange(lastDraggedPersonIndex, 1.2)}>Large</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { Scene };