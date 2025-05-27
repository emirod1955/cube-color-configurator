import { useMemo, useState } from "react";
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

  // State variables
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(null);
  const [offset, setOffset] = useState([0, 0, 0]);
  const dragThreshold = 5; // Minimum movement in pixels to consider as a drag

  // Spring animation for drag and hover effects
  const [spring, setSpring] = useSpring(() => ({
    scale: [1, 1, 1],
    position: position,
    rotation: [0, 0, 0],
    config: { friction: 10 },
  }));

  // Memoize the 3D model to prevent unnecessary re-renders
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

  // Gesture handling for drag and hover
  const bind = useGesture({
    onDragStart: ({ event }) => {
      setIsDragging(false); // Reset dragging state

      // Convert screen-space coordinates to normalized device coordinates (NDC)
      const ndcX = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
      const ndcY = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

      // Use a raycaster to project the cursor into the 3D scene
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);

      // Intersect with a plane at the same Y position as the model
      const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), spring.position.get()[1]);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      // Calculate the offset between the model's position and the intersection point
      const currentPosition = spring.position.get();
      setOffset([
        currentPosition[0] - intersection.x,
        currentPosition[1] - intersection.y,
        currentPosition[2] - intersection.z,
      ]);

      setStartPosition({ x: event.clientX, y: event.clientY }); // Store initial pointer position
      if (onDragStart) onDragStart(); // Trigger drag start callback
    },
    onDrag: ({ xy: [x, y], event }) => {
      if (!startPosition) return;

      // Calculate movement distance
      const deltaX = Math.abs(x - startPosition.x);
      const deltaY = Math.abs(y - startPosition.y);

      // Check if movement exceeds the drag threshold
      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        setIsDragging(true); // Mark as dragging

        // Convert screen-space coordinates to normalized device coordinates (NDC)
        const ndcX = (x / gl.domElement.clientWidth) * 2 - 1;
        const ndcY = -(y / gl.domElement.clientHeight) * 2 + 1;

        // Use a raycaster to project the cursor into the 3D scene
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);

        // Intersect with a plane at the same Y position as the model
        const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), spring.position.get()[1]);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);

        // Update the position of the model, applying the offset
        setSpring({
          position: [
            intersection.x + offset[0],
            spring.position.get()[1],
            intersection.z + offset[2],
          ],
        });
      }
    },
    onDragEnd: () => {
      setIsDragging(false); // Reset dragging state
      setStartPosition(null); // Clear initial pointer position
      if (onDragEnd) onDragEnd(); // Trigger drag end callback
    },
  });

  // Handle click events
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event propagation
    if (!isDragging && onClick) {
      onClick(); // Trigger click callback only if no drag occurred
    }
  };

  return (
  <a.group
      {...spring}
      {...bind()}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation(); // Prevent hover conflicts
      }}
      onPointerOut={(e) => {
        e.stopPropagation(); // Prevent hover conflicts
      }}
    >
      {/* Render the 3D model */}
      <primitive object={person} />
    </a.group>
);
};

export { Model };