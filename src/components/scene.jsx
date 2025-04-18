import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei"; // Import the Text component
import { Model } from "./Model";
import { StaticModel } from "./StaticModel";
import * as THREE from "three";

import './App.css';

function Scene() {
  const [numPersons, setNumPersons] = useState(1);
  const [persons, setPersons] = useState([
    { color: "#ffffff", size: 1, position: [0, 0, 0], name: "Emiliano", gender: "man" },
  ]);

  const [lastDraggedPersonIndex, setLastDraggedPersonIndex] = useState(null); // New state
  const [controlsEnabled, setControlsEnabled] = useState(true);

  const [woodText, setWoodText] = useState("FAMILY"); // State for the wooden text

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

  // const getPosition = (index) => {
  //   const gridSize = 3;
  //   const spacing = 3;
  //   const randomOffset = () => (Math.random() - 0.5) * 1.5;
  
  //   const row = Math.floor(index / gridSize);
  //   const col = index % gridSize;
  
  //   const x = col * spacing + randomOffset();
  //   const z = row * spacing + randomOffset();
  //   const y = 0;
  
  //   return [x, y, z];

  // };

  const getPosition = () => {
    const radius = 5;
  
    const r = Math.sqrt(Math.random()) * radius; // distribución uniforme en el área del círculo
    const angle = Math.random() * Math.PI * 2;
  
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
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

  const handleWoodTextChange = (e) => {
    setWoodText(e.target.value.toUpperCase()); // Convert to uppercase for consistency
  };

  
  const renderWoodenLetters = (woodText) => {
    const letters = woodText.split("");
    const radius = 5;
    const angleOffset = Math.PI / 2; // Start from top
    const angleStep = THREE.MathUtils.degToRad(24); // 12° per letter
  
    const groupRefs = useMemo(
      () => letters.map(() => React.createRef()),
      [letters.length]
    );
  
    return letters.map((letter, index) => {
      const angle = angleOffset - index * angleStep; // Clockwise around circle
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
  
      return (
        <group
          key={index}
          ref={groupRefs[index]}
          position={[x, 1, z]}
          onUpdate={(self) => {
            self.lookAt(0, 1, 0); // Look at center
            self.rotateY(Math.PI); // Flip to face out
          }}
        >
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2, 2, 0.3]} />
            <meshStandardMaterial 
            // color="#e2c095" 
            //light wood color
            color="#a49989"
            />
          </mesh>
  
          <Text
            position={[0, 0, 0.17]}
            fontSize={1}
            color={"#000000"}
            anchorX="center"
            anchorY="middle"
          >
            {letter}
          </Text>
        </group>
      );
    });
  };
  
  
  

  
  
  

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <div style={{ flex: 2 }}>
        <Canvas camera={{ position: [40, 40, 40], fov: 30 }} style={{ width: "100%", height: "100%" }}>
          <ambientLight intensity={1} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <StaticModel path="/models/base.glb" position={[1.5, -2, -4.5]} />
          {persons.map((person, i) => (
            <Model
              key={i}
              position={person.position}
              color={person.color}
              size={person.size}
              name={person.name}
              gender={person.gender}
              onClick={() => setSelectedPersonIndex(i)}
              onDragStart={handleDragStart}
              onDragEnd={() => handleDragEnd(i)} // Pass index to handler
            />
          ))}

          {/* Render the wooden letters */}
          {renderWoodenLetters(woodText)}

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

        {/* Add input for wooden text */}
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h3>Wooden Text</h3>
          <label>Text: </label>
          <input
            type="text"
            value={woodText}
            onChange={handleWoodTextChange}
            placeholder="Enter text"
            style={{ display: "block", marginBottom: "10px" }}
          />
        </div>
      </div>
    </div>
  );
}

export { Scene };