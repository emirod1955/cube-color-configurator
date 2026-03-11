"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Person {
  color: string;
  size: number;
  position: [number, number, number];
  name: string;
  gender: "man" | "woman";
  key?: number;
}

interface FormContextType {
  step: number;
  setStep: (step: number) => void;
  numPersons: number;
  setNumPersons: (n: number) => void;
  handleNumPersonsChange: (num: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  persons: Person[];
  setPersons: React.Dispatch<React.SetStateAction<Person[]>>;
  lastDraggedPersonIndex: number;
  setLastDraggedPersonIndex: (i: number) => void;
  handleGenderChange: (index: number, newGender: "man" | "woman") => void;
  handleSizeChange: (index: number, newSize: number) => void;
  woodText: string;
  setWoodText: (text: string) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

function getRandomColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

// Places people centered on the midpoint of the letter arc, in a row aligned with
// the camera's right axis (1,0,-1)/√2 so they appear as a clean horizontal line.
// For 6+ people, adds a second row offset along the camera depth axis (1,0,1)/√2.
function getDefaultPositions(persons: Person[], woodText: string): Person[] {
  const n = persons.length;

  // Compute arc midpoint from word length
  const numLetters = Math.min(Math.max(woodText.trim().length, 1), 15);
  const angleStep = (24 * Math.PI) / 180;
  const midAngle = Math.PI / 2 - ((numLetters - 1) / 2) * angleStep;
  const innerRadius = 2.2; // inside the letter circle (radius 5)
  const cx = Math.cos(midAngle) * innerRadius;
  const cz = Math.sin(midAngle) * innerRadius;

  // Camera right in xz: (1, 0, -1) / √2  →  horizontal row in screen space
  const rDx = 1 / Math.SQRT2;
  const rDz = -1 / Math.SQRT2;
  // Camera depth in xz (toward camera): (1, 0, 1) / √2
  const dDx = 1 / Math.SQRT2;
  const dDz = 1 / Math.SQRT2;

  const spacing = 2.0;  // wide enough so figures never overlap
  const depth = 1.2;    // row separation for 2-row layout

  if (n <= 5) {
    return persons.map((person, i) => {
      const s = (i - (n - 1) / 2) * spacing;
      return {
        ...person,
        position: [cx + s * rDx, 0, cz + s * rDz] as [number, number, number],
      };
    });
  }

  // 6–9 people: two staggered rows (front closer to camera)
  const frontCount = Math.ceil(n / 2);
  const backCount = n - frontCount;

  return persons.map((person, i) => {
    if (i < frontCount) {
      const s = (i - (frontCount - 1) / 2) * spacing;
      return {
        ...person,
        position: [cx + s * rDx + depth * dDx, 0, cz + s * rDz + depth * dDz] as [number, number, number],
      };
    } else {
      const j = i - frontCount;
      const s = (j - (backCount - 1) / 2) * spacing;
      return {
        ...person,
        position: [cx + s * rDx - depth * dDx, 0, cz + s * rDz - depth * dDz] as [number, number, number],
      };
    }
  });
}

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState(1);
  const [numPersons, setNumPersons] = useState(1);
  const [persons, setPersons] = useState<Person[]>([
    { color: "#ffffff", size: 1, position: [1.9, 0, 1.1], name: "", gender: "man" },
  ]);
  const [lastDraggedPersonIndex, setLastDraggedPersonIndex] = useState(0);
  const [woodText, setWoodText] = useState("FAMILY");

  const handleNumPersonsChange = useCallback((num: number) => {
    const value = Math.max(1, Math.min(9, parseInt(String(num), 10) || 1));
    setNumPersons(value);
    setPersons(() => {
      const newPersons: Person[] = Array.from({ length: value }, (_, i) => ({
        color: getRandomColor(),
        size: 1,
        position: [0, 0, 0] as [number, number, number],
        name: "",
        gender: "man" as const,
        key: i + 1,
      }));
      setLastDraggedPersonIndex(value - 1);
      return getDefaultPositions(newPersons, woodText);
    });
  }, [woodText]);

  const handleGenderChange = useCallback((index: number, newGender: "man" | "woman") => {
    setPersons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], gender: newGender };
      return updated;
    });
  }, []);

  const handleSizeChange = useCallback((index: number, newSize: number) => {
    setPersons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], size: newSize };
      return updated;
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

export const useForm = (): FormContextType => {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useForm must be used within a FormProvider");
  return ctx;
};
