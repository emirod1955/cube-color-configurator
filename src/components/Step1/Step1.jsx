import React from "react";
import { useForm } from "../context/FormContext";

//navigation
import StepNavigation from "../stepNav/stepNavigation";

//import assets
import plus from './assets/plus.svg'
import minus from './assets/minus.svg'

//import styles
import './Step1.css'

function Step1() {
  const {numPersons, handleNumPersonsChange, step} = useForm();

  return (
    <div className="step1">
      <div className="step1Blocks">
        <div className="step1Content">
            <div>
                <h1>NUMERO DE PERSONAS</h1>
                <p>Ingrese la cantidad de personas que quieres en tu cupula</p>
            </div>
            <div className="personInput">
                <input
                    type="number"
                    min="1"
                    max="9"
                    value={numPersons}
                    onChange={handleNumPersonsChange}
                    disabled
                />
                <span className="line"></span>
                <button onClick={() => handleNumPersonsChange(numPersons - 1)}><img src={minus} alt="-" /></button>
                <span className="line"></span>
                <button id="secondButton" onClick={() => handleNumPersonsChange(numPersons + 1)}><img src={plus} alt="+" /></button>
            </div>
        </div>
        <div className="step1NavBt">
            <StepNavigation/>
        </div>
      </div>
    </div>
  );
}

export  {Step1};
