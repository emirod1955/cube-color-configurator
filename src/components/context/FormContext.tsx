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

type Bounds = { cx: number; cz: number; r: number };

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
  dragBounds: Bounds | undefined;
  handleBoundsReady: (cx: number, cz: number, r: number) => void;
  screenshotUrl: string | null;
  setScreenshotUrl: (url: string | null) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const SWATCH_COLORS = [
  '#F5F5F5', '#222222', '#E63946', '#F4A261',
  '#2A9D8F', '#457B9D', '#6A0572', '#F1C40F',
  '#8B4513', '#A8D8EA',
];

function getRandomColor(): string {
  return SWATCH_COLORS[Math.floor(Math.random() * SWATCH_COLORS.length)];
}

// Family-photo layout: persons placed on concentric arcs that follow the base
// disc curvature. Largest persons in back rows (farthest from camera), smallest
// in front. Each row sits on a circle concentric with the base, so every person
// is guaranteed to stay within the draggable boundary.
function getDefaultPositions(
  persons: Person[],
  woodText: string,
  dragBounds?: Bounds,
): Person[] {
  const numLetters = Math.min(Math.max(woodText.trim().length, 1), 15);
  const angleStep = (24 * Math.PI) / 180;
  const midAngle = Math.PI / 2 - ((numLetters - 1) / 2) * angleStep;

  const SPACING     = 2.7;  // arc-length gap between adjacent persons in a row
  const ROW_DEPTH   = 2.8;  // radial distance between consecutive rows
  const BODY_RADIUS = 3.0;  // must match Model.tsx
  const FOOT_X      = -4.5;
  const FOOT_Z      =  2.0;

  // ── Build rows (pyramid: back row largest, up to MAX_PER_ROW) ─────────────

  const bySize = persons.reduce<Map<number, number[]>>((acc, p, i) => {
    acc.set(p.size, [...(acc.get(p.size) ?? []), i]);
    return acc;
  }, new Map());
  const sortedSizes = [...bySize.keys()].sort((a, b) => b - a);

  // Pyramid distribution (back rows largest, decrement by 2):
  //   9 → [5,3,1]  8 → [5,3]  7 → [5,2]  6 → [5,1]  ≤5 → single row
  const MAX_PER_ROW = 5;
  const rows: number[][] = [];
  for (const size of sortedSizes) {
    const indices = bySize.get(size)!;
    let start = 0;
    let maxRowSize = MAX_PER_ROW;
    while (start < indices.length) {
      const count = Math.min(maxRowSize, indices.length - start);
      rows.push(indices.slice(start, start + count));
      start += count;
      maxRowSize = Math.max(1, maxRowSize - 2);
    }
  }

  let numRows = rows.length;
  const result = [...persons];

  if (!dragBounds) {
    return result; // will be repositioned once bounds are ready
  }

  const effectiveR = dragBounds.r - BODY_RADIUS;

  // Minimum guaranteed spacing constraints:
  //   MIN_SPACING   – radial gap between consecutive rows (≥ 2.2 to clear persons)
  //   MIN_INNER_R   – minimum radius for the innermost row
  const MIN_SPACING = 2.3;
  const MIN_INNER_R = 1.3;

  const calcDepth = (nr: number) =>
    nr > 1 ? Math.min(ROW_DEPTH, (effectiveR - MIN_INNER_R) / (nr - 1)) : ROW_DEPTH;

  let effectiveROW_DEPTH = calcDepth(numRows);

  // If the spacing between rows is too tight, merge the two front-most rows
  // and recalculate until the spacing is acceptable.
  while (numRows > 1 && effectiveROW_DEPTH < MIN_SPACING) {
    const front = rows.pop()!;
    const prev  = rows.pop()!;
    rows.push([...prev, ...front]);
    numRows = rows.length;
    effectiveROW_DEPTH = calcDepth(numRows);
  }

  // All rows are arcs concentric with the base disc.
  // Row 0 (back, largest) sits at radius effectiveR; each subsequent row steps
  // inward by effectiveROW_DEPTH. Persons face the camera, so row centers point
  // in the anti-camera direction (backAngle = π + midAngle).
  const backAngle = Math.PI + midAngle;

  rows.forEach((rowIndices, rowIndex) => {
    const R     = effectiveR - rowIndex * effectiveROW_DEPTH;
    const count = rowIndices.length;
    const angStep = count > 1 && R > 0 ? SPACING / R : 0;

    rowIndices.forEach((personIdx, j) => {
      const angle = backAngle + (j - (count - 1) / 2) * angStep;
      const footX = dragBounds.cx + R * Math.cos(angle);
      const footZ = dragBounds.cz + R * Math.sin(angle);
      result[personIdx] = {
        ...persons[personIdx],
        position: [footX - FOOT_X, 0, footZ - FOOT_Z] as [number, number, number],
      };
    });
  });

  return result;
}

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState(1);
  const [numPersons, setNumPersons] = useState(1);
  const [persons, setPersons] = useState<Person[]>([
    { color: "#ffffff", size: 1, position: [1.9, 0, 1.1], name: "", gender: "man" },
  ]);
  const [lastDraggedPersonIndex, setLastDraggedPersonIndex] = useState(0);
  const [woodText, setWoodText] = useState("FAMILY");
  const [dragBounds, setDragBounds] = useState<Bounds | undefined>(undefined);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  // Called by WoodBase once the real draggable circle is known.
  // Repositions everyone to fit inside the bounds.
  const handleBoundsReady = useCallback((cx: number, cz: number, r: number) => {
    const bounds = { cx, cz, r };
    setDragBounds(bounds);
    setPersons(prev => getDefaultPositions(prev, woodText, bounds));
  }, [woodText]);

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
      return getDefaultPositions(newPersons, woodText, dragBounds);
    });
  }, [woodText, dragBounds]);

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
        dragBounds,
        handleBoundsReady,
        screenshotUrl,
        setScreenshotUrl,
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
