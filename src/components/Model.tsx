"use client";

import { useMemo, useState, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { useGesture } from "@use-gesture/react";
import { useSpring, a } from "@react-spring/three";
import { useThree } from "@react-three/fiber";

const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
const intersection = new THREE.Vector3();

interface ModelProps {
  position: [number, number, number];
  color: string;
  size: number;
  gender: "man" | "woman";
  dragBounds?: { cx: number; cz: number; r: number };
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const Model = ({ position, color, size, gender, dragBounds, onClick, onDragStart, onDragEnd }: ModelProps) => {
  const { scene: bodyScene } = useGLTF(
    gender === "man" ? "/models/body_man.glb" : "/models/body_woman.glb"
  );
  const { scene: headScene } = useGLTF("/models/head.glb");

  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const offset = useRef<[number, number, number]>([0, 0, 0]);
  const dragThreshold = 5;

  const [spring, setSpring] = useSpring(() => ({
    scale: [1, 1, 1] as [number, number, number],
    position,
    rotation: [0, 0, 0] as [number, number, number],
    config: { friction: 10 },
  }));

  const person = useMemo(() => {
    const body = clone(bodyScene);
    const head = clone(headScene);

    body.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
        (mesh.material as THREE.MeshStandardMaterial).color.set(color);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    head.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const group = new THREE.Group();
    group.add(body);
    group.add(head);

    const pivotX = -4.5;
    const pivotZ = 2.0;
    group.scale.set(size, size, size);
    group.position.set(pivotX * (1 - size), 0, pivotZ * (1 - size));

    return group;
  }, [color, size, bodyScene, headScene]);

  const getPlanePosition = (clientX: number, clientY: number) => {
    const ndcX = (clientX / gl.domElement.clientWidth) * 2 - 1;
    const ndcY = -(clientY / gl.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    plane.constant = spring.position.get()[1];
    raycaster.ray.intersectPlane(plane, intersection);
    return { x: intersection.x, z: intersection.z };
  };

  // The figure's foot sits at spring + (FOOT_X, FOOT_Z) regardless of size.
  // Constrain the foot to the base circle (shrunk by BODY_RADIUS so the
  // whole figure body stays inside), then back-calculate the spring position.
  const FOOT_X = -4.5;
  const FOOT_Z = 2.0;
  const BODY_RADIUS = 3.0; // approximate half-width of a figure

  const clamp = (springX: number, springZ: number) => {
    if (!dragBounds) return { x: springX, z: springZ };
    const footX = springX + FOOT_X;
    const footZ = springZ + FOOT_Z;
    const dx = footX - dragBounds.cx;
    const dz = footZ - dragBounds.cz;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const effectiveR = dragBounds.r - BODY_RADIUS;
    if (dist <= effectiveR) return { x: springX, z: springZ };
    return {
      x: dragBounds.cx + (dx / dist) * effectiveR - FOOT_X,
      z: dragBounds.cz + (dz / dist) * effectiveR - FOOT_Z,
    };
  };

  const bind = useGesture({
    onDragStart: ({ event }) => {
      setIsDragging(false);
      const e = event as MouseEvent;
      const pos = getPlanePosition(e.clientX, e.clientY);
      const currentPosition = spring.position.get();
      offset.current = [currentPosition[0] - pos.x, 0, currentPosition[2] - pos.z];
      startPosition.current = { x: e.clientX, y: e.clientY };
      onDragStart?.();
    },
    onDrag: ({ xy: [x, y] }) => {
      if (!startPosition.current) return;
      const deltaX = Math.abs(x - startPosition.current.x);
      const deltaY = Math.abs(y - startPosition.current.y);
      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        setIsDragging(true);
        const pos = getPlanePosition(x, y);
        const clamped = clamp(pos.x + offset.current[0], pos.z + offset.current[2]);
        setSpring({
          position: [clamped.x, spring.position.get()[1], clamped.z],
        });
      }
    },
    onDragEnd: () => {
      setIsDragging(false);
      startPosition.current = null;
      onDragEnd?.();
    },
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (!isDragging) onClick?.();
  };

  return (
    <a.group
      {...spring}
      {...(bind() as object)}
      onClick={handleClick}
      onPointerOver={(e: { stopPropagation: () => void }) => e.stopPropagation()}
      onPointerOut={(e: { stopPropagation: () => void }) => e.stopPropagation()}
    >
      <primitive object={person} />
    </a.group>
  );
};

export { Model };
