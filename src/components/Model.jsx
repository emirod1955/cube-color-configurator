import React, { useMemo, useState } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

const Model = ({ index, position, color, size, name, gender, onClick }) => {
  const { scene: bodyScene } = useGLTF(
    gender === "man" ? "/models/body_man.glb" : "/models/body_woman.glb"
  );
  const { scene: headScene } = useGLTF("/models/head.glb");

  const [isHovered, setIsHovered] = useState(false);

  // Memoize the model to prevent reloading on every render
  const person = useMemo(() => {
    const body = clone(bodyScene);
    const head = clone(headScene);

    // Apply color to the body mesh
    body.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.set(color);
      }
    });

    // Create a group to hold the body and head
    const group = new THREE.Group();
    group.add(body);
    group.add(head);

    // Apply size and position
    group.scale.set(size, size, size);
    group.position.set(...position);

    return group;
  }, [color, size, bodyScene, headScene, position]);

  return (
    <group
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = "pointer"; // Change cursor to pointer
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = "default"; // Reset cursor to default
      }}
    >
      {/* Render the 3D model */}
      <primitive object={person} />
      {isHovered && (
        <Html position={[0, size + 0.5, 0]}>
          <div style={{ background: "white", padding: "5px", borderRadius: "5px" }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

export { Model };