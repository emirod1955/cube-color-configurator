// App.jsx
import React from "react";
import { Scene } from "./components/scene";  // Import the Scene component


//import steps
import { Step1 } from "./components/Step1/Step1";
import { Step2 } from "./components/Step2/Step2";

//import context
import { useForm, FormProvider } from "./components/context/FormContext";

const FormSteps = () => {
  const { step, persons } = useForm();

  let steps = [
    <Step1 key="1" />,
    <Scene key={10} />
  ];

  let arrPersons = []

  persons.map((person, index) => 
    arrPersons.push(<Step2 person={person} index={index}/>)
  )

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
      <FormSteps />
    </FormProvider>
  );
}

export  {App};
