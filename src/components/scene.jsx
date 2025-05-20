import { useState} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei"; // Import the Text component
import { Model } from "./Model";
import { StaticModel } from "./StaticModel";

//import context
import { useForm } from "./context/FormContext";

//import styles
import './App.css';

function Scene() {
  const {
    persons, 
    setPersons, 
    lastDraggedPersonIndex, 
    setLastDraggedPersonIndex,
    woodText,
    renderWoodenLetters
  } = useForm();


  const [controlsEnabled, setControlsEnabled] = useState(true);

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
    setLastDraggedPersonIndex(index); // Update last dragged person
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <div style={{ flex: 2 }}>
        <Canvas camera={{ position: [40, 40, 40], fov: 30 }} style={{ width: "100%", height: "100%" }}>
          <ambientLight intensity={1.5} />
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

export { Scene }