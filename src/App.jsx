// App.jsx
import React from "react";
import { Scene } from "./components/scene";  // Import the Scene component

//import steps
import { Step1 } from "./components/Step1/Step1";
import { Step2 } from "./components/Step2/Step2";

import StepNavigation from "./components/stepNav/stepNavigation";
import { useForm, FormProvider } from "./components/context/FormContext";

const FormSteps = () => {
  const { step } = useForm();

  const steps = [
    <Step1 key="1" />,
    <Step2 key="2" />,
    <Scene key="2" />,
  ];

  return (
    <div className="form-container">
      <div className="form-step">
        {steps[step - 1]}
      </div>
    </div>
  );
};

function App() {

  return (
    <FormProvider>
      <FormSteps />
    </FormProvider>
  );
}

export  {App};
