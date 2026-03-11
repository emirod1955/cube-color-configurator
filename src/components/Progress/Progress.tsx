"use client";

import { useForm } from "../context/FormContext";
import './Progress.css';

function Progress() {
  const { step, persons, setStep } = useForm();

  return (
    <div className="progress">
      <div className="progressBar">
        <div className={`step ${step >= 1 ? "active" : ""}`} onClick={() => setStep(1)}>
          <span>1</span>
        </div>

        <div className={`line ${step > 1 ? "active" : ""}`}></div>

        <div className="progressStep2">
          <div className={`step ${step > 1 ? "active" : ""}`} onClick={() => setStep(2)}>
            2
          </div>
          <p>
            {step > 1 && step <= persons.length + 1
              ? step - 1
              : step > persons.length + 1
              ? persons.length
              : "0"}{" "}
            de {persons.length}
          </p>
        </div>

        <div className={`line ${step >= persons.length + 2 ? "active" : ""}`}></div>

        <div
          className={`step ${step >= persons.length + 2 ? "active" : ""}`}
          onClick={() => setStep(persons.length + 2)}
        >
          <span>3</span>
        </div>

        <div className={`line ${step >= persons.length + 3 ? "active" : ""}`}></div>

        <div
          className={`step ${step >= persons.length + 3 ? "active" : ""}`}
          onClick={() => setStep(persons.length + 3)}
        >
          <span>4</span>
        </div>
      </div>
    </div>
  );
}

export { Progress };
