"use client";

import { ReactElement } from "react";
import { Scene } from "./components/scene";
import { Step1 } from "./components/Step1/Step1";
import { Step3 } from "./components/Step3/Step3";
import { Confirmation } from "./components/Confirmation/Confirmation";
import { Progress } from "./components/Progress/Progress";
import { useForm, FormProvider } from "./components/context/FormContext";

const FormSteps = () => {
  const { step } = useForm();

  const steps: ReactElement[] = [
    <Step1 key="step1" />,
    <Step3 key="step2" />,
    <Scene key="step3" />,
    <Confirmation key="step4" />,
  ];

  return (
    <div className="form-container">
      <div className="form-step">{steps[step - 1]}</div>
    </div>
  );
};

function App() {
  return (
    <FormProvider>
      <Progress />
      <FormSteps />
    </FormProvider>
  );
}

export { App };
