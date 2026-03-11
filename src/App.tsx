"use client";

import { ReactElement } from "react";
import { Scene } from "./components/scene";
import { Step1 } from "./components/Step1/Step1";
import { Step2 } from "./components/Step2/Step2";
import { Step3 } from "./components/Step3/Step3";
import { Progress } from "./components/Progress/Progress";
import { useForm, FormProvider } from "./components/context/FormContext";

const FormSteps = () => {
  const { step, persons } = useForm();

  let steps: ReactElement[] = [
    <Step1 key="1" />,
    <Step3 key={10} />,
    <Scene key={11} />,
  ];

  const arrPersons = persons.map((person, index) => (
    <Step2 key={index} person={person} index={index} />
  ));

  steps = [
    ...steps.slice(0, 1),
    ...arrPersons,
    ...steps.slice(1),
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
      <Progress />
      <FormSteps />
    </FormProvider>
  );
}

export { App };
