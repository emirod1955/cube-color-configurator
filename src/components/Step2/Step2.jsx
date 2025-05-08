//import react
import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber"
import { Center } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

//import components and context
import StepNavigation from "../stepNav/stepNavigation"
import { useForm } from "../context/FormContext";

//import styles
import './Step2.css'


const Step2 = ({person, index}) => {
    const {setPersons, handleGenderChange, handleSizeChange} = useForm();

    const { scene: bodyScene } = useGLTF(
        person.gender === "man" ? "/models/body_man.glb" : "/models/body_woman.glb"
    );
    const { scene: headScene } = useGLTF("/models/head.glb");
    
    // Memoize the model to prevent reloading on every render
    const persona = useMemo(() => {
        const body = clone(bodyScene);
        const head = clone(headScene);
    
        // Apply color to the body mesh
        body.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.color.set(person.color);
            }
        });
    
        // Create a group to hold the body and head
        const group = new THREE.Group();
        group.add(body);
        group.add(head);
    
        // Apply size and position
        group.scale.set(person.size, person.size, person.size);
    
        return group;
    }, [person.color, person.size, bodyScene, headScene]);

    return(
        <div className="step2">
            <Canvas id="step2canvas" camera={{ position: [50, 5, 0], fov: 15 }} >
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <Center>
                <primitive object={persona} />
                </Center>
            </Canvas>
            <div className="inputsSide">
                <div className="inputsSideContent">
                    <div className="inputsSideContent-name">
                        <label>Nombre</label>
                        <input
                            type="text"
                            value={person.name}
                            onChange={(e) => {
                                const newName = e.target.value;
                                setPersons((prevPersons) => {
                                    const updatedPersons = [...prevPersons];
                                    updatedPersons[index].name = newName;
                                    return updatedPersons;
                                });
                            }}
                            placeholder="Ingrese nombre"
                        />
                    </div>

                <div className="inputsSideContent-gender">
                    <label htmlFor="options">Genero</label>
                    <select id="options" className="custom-dropdown" value={person.gender} onChange={(e) => handleGenderChange(index, e.target.value)}>
                        <option value="man">Masculino</option>
                        <option value="woman">Femenino</option>
                    </select>
                </div>

                
                <div className="inputsSideContent-color">
                    <label>Color</label>
                    <div>
                        <input
                            type="color"
                            value={person.color}
                            onChange={(e) => {
                                const newColor = e.target.value;
                                setPersons((prevPersons) => {
                                    const updatedPersons = [...prevPersons];
                                    updatedPersons[index].color = newColor;
                                    return updatedPersons;
                                });
                            }}
                        />
                        <p>{(person.color).slice(1).toUpperCase()}</p>
                    </div>
                </div>

                <div className="inputsSideContent-size">
                    <label>Tamaño</label>
                    <div>
                        <button onClick={() => handleSizeChange(index, 0.8)} style={{backgroundColor: person.size == 0.8 ? '#333' : '#fff', color: person.size == 0.8 ? '#fff' : '#000',}}>S</button>
                        <button onClick={() => handleSizeChange(index, 1)} style={{backgroundColor: person.size == 1 ? '#333' : '#fff', color: person.size == 1 ? '#fff' : '#000',}}>M</button>
                        <button onClick={() => handleSizeChange(index, 1.2)} style={{backgroundColor: person.size == 1.2 ? '#333' : '#fff', color: person.size == 1.2 ? '#fff' : '#000',}}>L</button>
                    </div>
                </div>

                <StepNavigation/>
                </div>
            </div>
        </div>
    )
}

export {Step2}