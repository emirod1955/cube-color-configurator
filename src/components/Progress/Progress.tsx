"use client";

import { useForm } from "../context/FormContext";
import './Progress.css';

function Progress() {
  const { step, setStep } = useForm();

  const labels = ["Personas", "Texto", "Diseño", "Confirmar"];

  return (
    <div className="progress">
      <div className="progressBar">
        {labels.map((label, i) => (
          <span key={i} style={{ display: "contents" }}>
            {i > 0 && <div className={`line ${step > i ? "active" : ""}`} />}
            <div
              className={`step ${step >= i + 1 ? "active" : ""}`}
              onClick={() => { if (step > i + 1) setStep(i + 1); }}
              title={label}
            >
              <span>{i + 1}</span>
            </div>
          </span>
        ))}
      </div>
    </div>
  );
}

export { Progress };
