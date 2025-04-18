import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { useGesture } from "react-use-gesture";
import { useSpring, a } from "@react-spring/three";
import { useThree } from "@react-three/fiber";

const Model = ({ position, color, size, gender, onClick, onDragStart, onDragEnd }) => {
  const { scene: bodyScene } = useGLTF(
    gender === "man" ? "/models/body_man.glb" : "/models/body_woman.glb"
  );
  const { scene: headScene } = useGLTF("/models/head.glb");

  const { camera, gl } = useThree(); // Access the camera and renderer

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

  // Spring animation for drag and hover effects
  const [spring, set] = useSpring(() => ({
    scale: [1, 1, 1],
    position: position,
    rotation: [0, 0, 0],
    config: { friction: 10 },
  }));

  // Gesture handling for drag and hover
  const bind = useGesture({
    onDragStart: () => {
      if (onDragStart) onDragStart(); // Call drag start handler
    },
    onDrag: ({ xy: [x, y] }) => {
      // Convert screen-space coordinates to normalized device coordinates (NDC)
      const ndcX = (x / gl.domElement.clientWidth) * 2 - 1;
      const ndcY = -(y / gl.domElement.clientHeight) * 2 + 1;

      // Use a raycaster to project the cursor into the 3D scene
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);

      // Intersect with a plane at the same Y position as the model
      const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), position[1]);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      // Update the position of the model
      set({ position: [intersection.x, position[1], intersection.z] });
    },
    onDragEnd: () => {
      if (onDragEnd) onDragEnd(); // Call drag end handler
    }
  });

  return (
    <a.group
      {...spring}
      {...bind()}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer"; // Change cursor to pointer
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "default"; // Reset cursor to default
      }}
    >
      {/* Render the 3D model */}
      <primitive object={person} />

    </a.group>
  );
};

export { Model };