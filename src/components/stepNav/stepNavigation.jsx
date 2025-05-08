import React from "react";
import { useForm } from "../context/FormContext";

import { useEffect } from "react";

//import styles
import './stepNavigation.css'

//import assets
import arr from './arr.svg'

function StepNavigation() {
  const { step, nextStep, prevStep } = useForm();

  return (
    <div className="stepNavButtons">
      {step > 1 && 
        <button className="navBack" onClick={prevStep}>
          <img src={arr} alt="arrow" />
          <p>Atras</p>
        </button>}
        <button className="navNext" onClick={nextStep}>Siguiente</button>
    </div>
  );
}

export default StepNavigation;
