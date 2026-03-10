import { createContext, useContext, useState, useCallback } from "react";
import * as THREE from "three";

const FormContext = createContext();

function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

function getOrderedCirclePositions(persons, maxRadius = 2.5, center = [2, 0, -1], minSpacing = 1) {
  const positions = [];
  for (let i = 0; i < persons.length; i++) {
    let tries = 0;
    let pos;
    do {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * (maxRadius * 0.7) + maxRadius * 0.3;
      const x = center[0] + radius * Math.cos(angle);
      const z = center[2] + radius * Math.sin(angle);
      pos = [x, center[1], z];
      tries++;
    } while (
      positions.some(
        ([px, , pz]) => Math.sqrt((pos[0] - px) ** 2 + (pos[2] - pz) ** 2) < minSpacing
      ) && tries < 100
    );
    positions.push(pos);
  }
  return persons.map((person, i) => ({ ...person, position: positions[i] }));
}

export const FormProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [numPersons, setNumPersons] = useState(1);
  const [persons, setPersons] = useState([
    { color: "#ffffff", size: 1, position: [0, 0, 0], name: "", gender: "man" },
  ]);
  const [lastDraggedPersonIndex, setLastDraggedPersonIndex] = useState(0);
  const [woodText, setWoodText] = useState("FAMILY");

  const handleNumPersonsChange = useCallback((num) => {
    const value = Math.max(1, Math.min(9, parseInt(num, 10) || 1));
    setNumPersons(value);
    setPersons(() => {
      const newPersons = Array.from({ length: value }, (_, i) => ({
        color: getRandomColor(),
        size: 1,
        position: [0, 0, 0],
        name: "",
        gender: "man",
        key: i + 1,
      }));
      setLastDraggedPersonIndex(value - 1);
      return getOrderedCirclePositions(newPersons);
    });
  }, []);

  const handleGenderChange = useCallback((index, newGender) => {
    setPersons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], gender: newGender };
      return updated;
    });
  }, []);

  const handleSizeChange = useCallback((index, newSize) => {
    setPersons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], size: newSize };
      return getOrderedCirclePositions(updated);
    });
  }, []);

  const nextStep = useCallback(() => setStep((prev) => prev + 1), []);
  const prevStep = useCallback(() => setStep((prev) => prev - 1), []);

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
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);
