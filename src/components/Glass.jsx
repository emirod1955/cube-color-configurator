import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three"; // Import THREE for MeshPhysicalMaterial

const Glass = ({ path, position }) => {
  const { scene } = useGLTF(path);

  useEffect(() => {
    // Traverse the model and update material properties for a glass effect
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
            color: "#ffffff", // Base color of the glass
            transparent: true, // Enable transparency
            opacity: 0.2, // Lower opacity for better transparency
            roughness: 0, // Smooth surface
            metalness: 0, // No metallic look
            ior: 1.5, // Index of refraction for glass
            transmission: 1, // Full light transmission
            thickness: 0.1, // Thickness of the glass
          });
      }
    });
  }, [scene]);

  return <primitive object={scene} position={position} />;
};

export { Glass };