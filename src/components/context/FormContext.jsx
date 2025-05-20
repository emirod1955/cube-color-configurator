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
  const [lastDraggedPersonIndex, setLastDraggedPersonIndex] = useState(null);
  const [woodText, setWoodText] = useState("FAMILY"); // State for the wooden text

  const handleNumPersonsChange = (num) => {
    const value = Math.max(1, Math.min(9, parseInt(num, 10) || 1));
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
                name: "",
                gender: "man",
                key: i + 1
              }
        );
        setLastDraggedPersonIndex(i); // Update last dragged person index
      }
      return newPersons;  
    });
  };

  const getPosition = () => {
    const radius = 5;
  
    const r = Math.sqrt(Math.random()) * radius;
    const angle = Math.random() * Math.PI * 2;
  
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = 0;
  
    return [x, y, z];
    
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