import { createContext, useContext, useState } from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [numPersons, setNumPersons] = useState(1);
  const [persons, setPersons] = useState([
      { color: "#ffffff", size: 1, position: [0, 0, 0], name: "Emiliano", gender: "man" },
    ]);
  const [lastDraggedPersonIndex, setLastDraggedPersonIndex] = useState(null); // New state
  
  // const handleNumPersonsChange = (e) => {
  //   const value = Math.max(1, Math.min(9, parseInt(e.target.value, 10) || 1));
  //   setNumPersons(value);
  
  //   setPersons((prevPersons) => {
  //     const newPersons = [];
  //     for (let i = 0; i < value; i++) {
  //       newPersons.push(
  //         prevPersons[i]
  //           ? { ...prevPersons[i] }
  //           : {
  //               color: "#ffffff",
  //               size: 1,
  //               position: getPosition(i),
  //               name: `Person ${i + 1}`,
  //               gender: "man",
  //             }
  //       );
  //       setLastDraggedPersonIndex(i); // Update last dragged person index
  //     }
  //     return newPersons;  
  //   });
  // };

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
                name: `Person ${i + 1}`,
                gender: "man",
              }
        );
        setLastDraggedPersonIndex(i); // Update last dragged person index
      }
      return newPersons;  
    });
  };

  const getPosition = () => {
    const radius = 5;
  
    const r = Math.sqrt(Math.random()) * radius; // distribución uniforme en el área del círculo
    const angle = Math.random() * Math.PI * 2;
  
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = 0;
  
    return [x, y, z];
    
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const resetForm = () => {
    setStep(1);
    setFormData({ name: "", email: "", age: "" });
  };

  return (
    <FormContext.Provider
      value={{ step, 
        setStep, 
        handleNumPersonsChange, 
        numPersons, 
        setNumPersons, 
        nextStep, 
        prevStep, 
        resetForm, 
        persons, 
        setPersons, 
        lastDraggedPersonIndex, 
        setLastDraggedPersonIndex
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);
