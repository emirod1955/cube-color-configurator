import React, { createContext, useContext, useState, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [numPersons, setNumPersons] = useState(1);
  const [persons, setPersons] = useState([
      { color: "#ffffff", size: 1, position: [0, 0, 0], name: "", gender: "man" },
    ]);
  const [lastDraggedPersonIndex, setLastDraggedPersonIndex] = useState(0);
  const [woodText, setWoodText] = useState("FAMILY"); // State for the wooden text

  const updatePersonsPositions = (personsArr) => {
  return getOrderedCirclePositions(personsArr);
};

function getRandomColor() {
  // Generates a random hex color
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

const handleNumPersonsChange = (num) => {
  const value = Math.max(1, Math.min(9, parseInt(num, 10) || 1));
  setNumPersons(value);

  setPersons(() => {
    const newPersons = [];
    for (let i = 0; i < value; i++) {
      newPersons.push({
        color: getRandomColor(),
        size: 1,
        position: [0, 0, 0],
        name: "",
        gender: "man",
        key: i + 1
      });
    }
    setLastDraggedPersonIndex(value - 1);
    return updatePersonsPositions(newPersons);
  });
};

const getOrderedCirclePositions = (
  persons,
  maxRadius = 2.5,
  center = [2, 0, -1],
  minSpacing = 1  
) => {
  const positions = [];
  for (let i = 0; i < persons.length; i++) {
    let tries = 0;
    let pos;
    do {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * (maxRadius * 0.7) + maxRadius * 0.3;
      const x = center[0] + radius * Math.cos(angle);
      const z = center[2] + radius * Math.sin(angle);
      const y = center[1];
      pos = [x, y, z];
      tries++;
      // Check distance to all previous positions
    } while (
      positions.some(
        ([px, py, pz]) =>
          Math.sqrt((pos[0] - px) ** 2 + (pos[2] - pz) ** 2) < minSpacing
      ) && tries < 100
    );
    positions.push(pos);
  }
  return persons.map((person, i) => ({
    ...person,
    position: positions[i],
  }));
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
    return updatePersonsPositions(updatedPersons);
  });
};

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const renderWoodenLetters = (woodText) => {
        const maxLetters = 15;
        const letters = woodText.slice(0, maxLetters).split("");
    
        const radius = 5;
        const angleOffset = Math.PI / 2; // Start from top
        const angleStep = THREE.MathUtils.degToRad(24); // 12° per letter
    
        const groupRefs = useMemo(() => 
            letters.map(() =>
                React.createRef()),
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
    <FormContext.Provider
      value={{ 
        step, 
        setStep, 
        handleNumPersonsChange, 
        numPersons, 
        setNumPersons, 
        nextStep, 
        prevStep, 
        persons, 
        setPersons, 
        lastDraggedPersonIndex, 
        setLastDraggedPersonIndex,
        handleGenderChange,
        handleSizeChange,
        woodText,
        setWoodText,
        renderWoodenLetters
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);