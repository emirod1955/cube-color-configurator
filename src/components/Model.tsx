"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { useGesture } from "@use-gesture/react";
import { useSpring, a } from "@react-spring/three";
import { useThree, useFrame } from "@react-three/fiber";

const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
const intersection = new THREE.Vector3();

interface ModelProps {
  position: [number, number, number];
  color: string;
  size: number;
  gender: "man" | "woman";
  dragBounds?: { cx: number; cz: number; r: number };
  letterPositions?: { x: number; z: number }[];
  personIndex?: number;
  personPositionsRef?: React.MutableRefObject<([number, number, number] | undefined)[]>;
  personSizesRef?: React.MutableRefObject<(number | undefined)[]>;
  isDraggingAnyRef?: React.MutableRefObject<boolean>;
  isSelected?: boolean;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const Model = ({ position, color, size, gender, dragBounds, letterPositions, personIndex, personPositionsRef, personSizesRef, isDraggingAnyRef, isSelected, onClick, onDragStart, onDragEnd }: ModelProps) => {
  const { scene: bodyScene } = useGLTF(
    gender === "man" ? "/models/body_man.glb" : "/models/body_woman.glb"
  );
  const { scene: headScene } = useGLTF("/models/head.glb");

  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false); // ref copy so useFrame never reads stale state
  const postDragFramesRef = useRef(0); // keep clamping for N frames after release
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const offset = useRef<[number, number, number]>([0, 0, 0]);
  const groupRef = useRef<THREE.Group>(null);
  const dragThreshold = 5;

  const [spring, setSpring] = useSpring(() => ({
    scale: [1, 1, 1] as [number, number, number],
    position,
    rotation: [0, 0, 0] as [number, number, number],
    config: { friction: 10 },
  }));

  // Sync spring to the position prop whenever it changes (e.g. after getDefaultPositions
  // repositions everyone). Skip during active drags — the spring is under gesture control.
  useEffect(() => {
    if (!isDraggingRef.current) {
      setSpring({ position, immediate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1], position[2]]);


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
  // Constrain the foot to the base circle and repel it from letter tiles.
  const FOOT_X = -4.5;
  const FOOT_Z = 2.0;
  const BODY_RADIUS = 3.0;
  const LETTER_MIN_DIST = 2;
  // Half-width of a size-1.0 figure; minimum foot distance = (sizeA + sizeB) * HALF_BODY
  const HALF_BODY = 1.1;

  const clamp = (springX: number, springZ: number) => {
    let footX = springX + FOOT_X;
    let footZ = springZ + FOOT_Z;

    // 1. Repel dragged person from stationary persons (size-aware).
    //    Stationary persons never move — only the dragged person is pushed away.
    if (personPositionsRef?.current && personIndex !== undefined) {
      for (let i = 0; i < personPositionsRef.current.length; i++) {
        if (i === personIndex) continue;
        const other = personPositionsRef.current[i];
        if (!other) continue;
        const otherSize = personSizesRef?.current[i] ?? 1.0;
        const minDist = (size + otherSize) * HALF_BODY;
        const otherFootX = other[0] + FOOT_X;
        const otherFootZ = other[2] + FOOT_Z;
        const pdx = footX - otherFootX;
        const pdz = footZ - otherFootZ;
        const pdist = Math.sqrt(pdx * pdx + pdz * pdz);
        if (pdist < minDist) {
          if (pdist < 0.001) {
            footX += minDist;
          } else {
            footX = otherFootX + (pdx / pdist) * minDist;
            footZ = otherFootZ + (pdz / pdist) * minDist;
          }
        }
      }
    }

    // 2. Repel from letter tiles
    if (letterPositions) {
      for (const { x: lx, z: lz } of letterPositions) {
        const ldx = footX - lx;
        const ldz = footZ - lz;
        const ldist = Math.sqrt(ldx * ldx + ldz * ldz);
        if (ldist < LETTER_MIN_DIST && ldist > 0) {
          footX = lx + (ldx / ldist) * LETTER_MIN_DIST;
          footZ = lz + (ldz / ldist) * LETTER_MIN_DIST;
        }
      }
    }

    // 3. Clamp to base circle (last so figure always stays on base)
    if (dragBounds) {
      const dx = footX - dragBounds.cx;
      const dz = footZ - dragBounds.cz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const effectiveR = dragBounds.r - BODY_RADIUS;
      if (dist > effectiveR) {
        footX = dragBounds.cx + (dx / dist) * effectiveR;
        footZ = dragBounds.cz + (dz / dist) * effectiveR;
      }
    }

    return { x: footX - FOOT_X, z: footZ - FOOT_Z };
  };

  useFrame(() => {
    if (!groupRef.current) return;
    const [x, y, z] = spring.position.get();

    // Always publish position and size so other persons can read them when dragged.
    if (personPositionsRef?.current && personIndex !== undefined) {
      personPositionsRef.current[personIndex] = [x, y, z];
    }
    if (personSizesRef?.current && personIndex !== undefined) {
      personSizesRef.current[personIndex] = size;
    }

    // Clamp while dragging AND for a short window after release so residual
    // spring motion can't carry the person past the repulsion boundary.
    // postDragFramesRef starts at 0 on mount so the spawn-fly bug is not reintroduced.
    if (!isDraggingRef.current) {
      if (postDragFramesRef.current <= 0) return;
      postDragFramesRef.current--;
    }

    const clamped = clamp(x, z);
    if (Math.abs(clamped.x - x) > 0.001 || Math.abs(clamped.z - z) > 0.001) {
      groupRef.current.position.x = clamped.x;
      groupRef.current.position.z = clamped.z;
      spring.position.set([clamped.x, y, clamped.z]);
    }
  });

  const bind = useGesture({
    onDragStart: ({ event }) => {
      if (isDraggingAnyRef?.current) return; // another person is already being dragged
      setIsDragging(false);
      isDraggingRef.current = false;
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
        isDraggingRef.current = true;
        const pos = getPlanePosition(x, y);
        const clamped = clamp(pos.x + offset.current[0], pos.z + offset.current[2]);

        // Block movement if the clamped position still overlaps any person —
        // i.e. there is no room to fit here. Person stays where it is.
        let blocked = false;
        if (personPositionsRef?.current && personIndex !== undefined) {
          const cfx = clamped.x + FOOT_X;
          const cfz = clamped.z + FOOT_Z;
          for (let i = 0; i < personPositionsRef.current.length; i++) {
            if (i === personIndex) continue;
            const other = personPositionsRef.current[i];
            if (!other) continue;
            const otherSize = personSizesRef?.current[i] ?? 1.0;
            const minDist = (size + otherSize) * HALF_BODY;
            const dx = cfx - (other[0] + FOOT_X);
            const dz = cfz - (other[2] + FOOT_Z);
            if (Math.sqrt(dx * dx + dz * dz) < minDist - 0.01) {
              blocked = true;
              break;
            }
          }
        }

        if (!blocked) {
          setSpring({
            position: [clamped.x, spring.position.get()[1], clamped.z],
            immediate: true,
          });
        }
      }
    },
    onDragEnd: () => {
      // Snap to the clamped position immediately so no residual spring motion escapes.
      const [x, y, z] = spring.position.get();
      const snapped = clamp(x, z);
      setSpring({ position: [snapped.x, y, snapped.z], immediate: true });
      // Then keep clamping in useFrame for a few more frames as a safety net.
      postDragFramesRef.current = 30;
      setIsDragging(false);
      isDraggingRef.current = false;
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
      ref={groupRef}
      {...spring}
      {...(bind() as object)}
      onClick={handleClick}
      onPointerOver={(e: { stopPropagation: () => void }) => e.stopPropagation()}
      onPointerOut={(e: { stopPropagation: () => void }) => e.stopPropagation()}
    >
      <primitive object={person} />
      {isSelected && (
        <mesh position={[-4.5, 0.05, 2.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6 * size, 2.2 * size, 48]} />
          <meshBasicMaterial color="#111111" opacity={0.25} transparent />
        </mesh>
      )}
    </a.group>
  );
};

export { Model };
