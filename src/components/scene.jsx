import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useState, useEffect } from "react";

function Model({ color1, color2 }) {
  const { scene: scene1 } = useGLTF("/models/cube1.glb");
  const { scene: scene2 } = useGLTF("/models/cube2.glb");

  useEffect(() => {
    if (scene1 && scene2) {

      scene1.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(color1);
          child.scale.set(1, 1, 1); // Make sure it's not too small
        }
      });

      scene2.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(color2);
          child.scale.set(1, 1, 1);
        }
      });
    }
  }, [color1, color2, scene1, scene2]);

  return (
    <>
      <primitive object={scene1} position={[0, 0, 0]} scale={1} />
      <primitive object={scene2} position={[0, 0, 0]} scale={1} />
    </>
  );
}

function Scene() {
  const [color1, setColor1] = useState("#fcba03");
  const [color2, setColor2] = useState("#00ff00");

  return (
    <div>
      <Canvas camera={{ position: [20, 40, 60], fov: 50 }} style={{ width: "100%", height: "100vh" }}
>
        {/* Lights */}
        <ambientLight intensity={1} />
        <directionalLight position={[3, 5, 2]} intensity={2} />

        {/* Models */}
        <Model color1={color1} color2={color2} />

        {/* Controls */}
        <OrbitControls />
      </Canvas>

      {/* Color Pickers */}
      <div style={{ position: "absolute", top: "10px", left: "10px" }}>
        <label>Cube 1: </label>
        <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} />
        <label>Cube 2: </label>
        <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} />
      </div>
    </div>
  );
}

export {Scene}