import { useForm } from "../context/FormContext";

//import styles
import './Progress.css'

function Progress() {
    const { step, persons } = useForm();
    
    return (
        <div className="progress">
            <div className="progressBar">
                <div className={`step ${step >= 1 ? "active" : ""}`}>
                    <span>1</span>
                </div>

                <div className={`line ${step > 1 ? "active" : ""}`}></div>
                
                <div className="progressStep2">
                    <div className={`step ${step > 1 ? "active" : ""}`}>
                        2
                    </div>
                    <p>
                    {
                        step > 1 && step <= persons.length + 1
                        ? step - 1
                        : step > persons.length + 1
                        ? persons.length
                        : "0"}{" "} de {persons.length}
                    </p>
                </div>
            
                <div className={`line ${step >= persons.length + 2 ? "active" : ""}`}></div>
            
                <div className={`step ${step >= persons.length + 2 ? "active" : ""}`}>
                    <span>3</span>
                </div>
            
                <div className={`line ${step >= persons.length + 3 ? "active" : ""}`}></div>
            
            
                <div className={`step ${step >= persons.length + 3 ? "active" : ""}`}>
                    <span>4</span>
                </div>
            </div>
        </div>
    );
}

export { Progress };
