import { useMemo, useState, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { useGesture } from "@use-gesture/react";
import { useSpring, a } from "@react-spring/three";
import { useThree } from "@react-three/fiber";

// Reuse across renders to avoid per-frame allocations
const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
const intersection = new THREE.Vector3();

const Model = ({ position, color, size, gender, onClick, onDragStart, onDragEnd }) => {
  const { scene: bodyScene } = useGLTF(
    gender === "man" ? "/models/body_man.glb" : "/models/body_woman.glb"
  );
  const { scene: headScene } = useGLTF("/models/head.glb");

  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef(null);
  const offset = useRef([0, 0, 0]);
  const dragThreshold = 5;

  const [spring, setSpring] = useSpring(() => ({
    scale: [1, 1, 1],
    position,
    rotation: [0, 0, 0],
    config: { friction: 10 },
  }));

  // Only re-clone when color/size/geometry change — not on position updates
  const person = useMemo(() => {
    const body = clone(bodyScene);
    const head = clone(headScene);

    body.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.set(color);
      }
    });

    const group = new THREE.Group();
    group.add(body);
    group.add(head);
    group.scale.set(size, size, size);

    return group;
  }, [color, size, bodyScene, headScene]);

  const getWorldPosition = (clientX, clientY) => {
    const ndcX = (clientX / gl.domElement.clientWidth) * 2 - 1;
    const ndcY = -(clientY / gl.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
    plane.constant = spring.position.get()[1];
    raycaster.ray.intersectPlane(plane, intersection);
    return { x: intersection.x, z: intersection.z };
  };

  const bind = useGesture({
    onDragStart: ({ event }) => {
      setIsDragging(false);
      const pos = getWorldPosition(event.clientX, event.clientY);
      const currentPosition = spring.position.get();
      offset.current = [currentPosition[0] - pos.x, 0, currentPosition[2] - pos.z];
      startPosition.current = { x: event.clientX, y: event.clientY };
      onDragStart?.();
    },
    onDrag: ({ xy: [x, y] }) => {
      if (!startPosition.current) return;
      const deltaX = Math.abs(x - startPosition.current.x);
      const deltaY = Math.abs(y - startPosition.current.y);
      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        setIsDragging(true);
        const pos = getWorldPosition(x, y);
        setSpring({
          position: [
            pos.x + offset.current[0],
            spring.position.get()[1],
            pos.z + offset.current[2],
          ],
        });
      }
    },
    onDragEnd: () => {
      setIsDragging(false);
      startPosition.current = null;
      onDragEnd?.();
    },
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isDragging) onClick?.();
  };

  return (
    <a.group
      {...spring}
      {...bind()}
      onClick={handleClick}
      onPointerOver={(e) => e.stopPropagation()}
      onPointerOut={(e) => e.stopPropagation()}
    >
      <primitive object={person} />
    </a.group>
  );
};

export { Model };
