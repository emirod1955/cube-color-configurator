"use client";

import { useMemo } from "react";
import { useGLTF, Center } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

import StepNavigation from "../stepNav/stepNavigation";
import { useForm } from "../context/FormContext";
import { Person } from "../context/FormContext";
import './Step2.css';

interface Step2Props {
  person: Person;
  index: number;
}

const Step2 = ({ person, index }: Step2Props) => {
  const { setPersons, handleGenderChange, handleSizeChange } = useForm();

  const { scene: bodyScene } = useGLTF(
    person.gender === "man" ? "/models/body_man.glb" : "/models/body_woman.glb"
  );
  const { scene: headScene } = useGLTF("/models/head.glb");

  const persona = useMemo(() => {
    const body = clone(bodyScene);
    const head = clone(headScene);

    body.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
        (mesh.material as THREE.MeshStandardMaterial).color.set(person.color);
      }
    });

    const group = new THREE.Group();
    group.add(body);
    group.add(head);
    group.scale.set(person.size, person.size, person.size);
    group.position.set(-4.5 * (1 - person.size), 0, 2.0 * (1 - person.size));

    return group;
  }, [person.color, person.size, bodyScene, headScene]);

  return (
    <div className="step2">
      <div style={{ flex: 1, background: '#F4F2EE', height: '100vh' }}>
      <Canvas id="step2canvas" camera={{ position: [50, 0, 0], fov: 15 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <Center>
          <primitive object={persona} />
        </Center>
      </Canvas>
      </div>
      <div className="inputsSide">
        <div className="inputsSideContent">
          <h2>Persona {index + 1}</h2>
          <div className="inputsSideContent-gender">
            <label htmlFor="options">Genero</label>
            <select
              id="options"
              className="custom-dropdown"
              value={person.gender}
              onChange={(e) => handleGenderChange(index, e.target.value as "man" | "woman")}
            >
              <option value="man">Masculino</option>
              <option value="woman">Femenino</option>
            </select>
          </div>

          <div className="inputsSideContent-color">
            <label>Color</label>
            <div className="color-swatches">
              {[
                '#F5F5F5', '#222222', '#E63946', '#F4A261',
                '#2A9D8F', '#457B9D', '#6A0572', '#F1C40F',
                '#8B4513', '#A8D8EA', '#F4A7B9', '#9E9E9E',
              ].map((c) => (
                <button
                  key={c}
                  className={`color-swatch${person.color === c ? ' selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() =>
                    setPersons((prev) => {
                      const updated = [...prev];
                      updated[index] = { ...updated[index], color: c };
                      return updated;
                    })
                  }
                />
              ))}
            </div>
          </div>

          <div className="inputsSideContent-size">
            <label>Tamaño</label>
            <div>
              {([0.8, 1, 1.2] as const).map((s, i) => (
                <button
                  key={s}
                  onClick={() => handleSizeChange(index, s)}
                  style={{
                    backgroundColor: person.size === s ? '#333' : '#fff',
                    color: person.size === s ? '#fff' : '#000',
                  }}
                >
                  {(['S', 'M', 'L'] as const)[i]}
                </button>
              ))}
            </div>
          </div>

          <StepNavigation />
        </div>
      </div>
    </div>
  );
};

export { Step2 };
