"use client";

import { useForm } from "../context/FormContext";
import './stepNavigation.css';

import arr from './arr.svg';

function StepNavigation() {
  const { step, nextStep, prevStep } = useForm();

  return (
    <div className="stepNavButtons">
      {step > 1 &&
        <button className="navBack" onClick={prevStep}>
          <img src={(arr as { src: string }).src ?? (arr as string)} alt="arrow" />
          <p>Atras</p>
        </button>}
      <button className="navNext" onClick={nextStep}>Siguiente</button>
    </div>
  );
}

export default StepNavigation;
