"use client";

import * as THREE from "three";

export const PET_TYPES = [
  { id: "perro",   label: "Perro",   emoji: "🐕", color: "#8B4513" },
  { id: "gato",    label: "Gato",    emoji: "🐈", color: "#888888" },
  { id: "conejo",  label: "Conejo",  emoji: "🐇", color: "#E8E0D0" },
  { id: "pajaro",  label: "Pájaro",  emoji: "🐦", color: "#2A9D8F" },
  { id: "hamster", label: "Hámster", emoji: "🐹", color: "#D4956A" },
  { id: "tortuga", label: "Tortuga", emoji: "🐢", color: "#4A7C59" },
  { id: "otro",    label: "Otro",    emoji: "📷", color: "#8B4513" },
] as const;

export type PetTypeId = typeof PET_TYPES[number]["id"];

interface PetModelProps {
  type: PetTypeId;
  color: string;
  position: [number, number, number];
}

export const PET_SCALE = 1.15;
const SCALE = PET_SCALE;

function Mat({ color }: { color: string }) {
  return <meshLambertMaterial color={new THREE.Color(color)} />;
}

/* ── Perro genérico ─────────────────────────────────────── */
function Perro({ color }: { color: string }) {
  return (
    <group scale={[SCALE, SCALE, SCALE]}>
      {/* Patas */}
      {[[-0.32, 0.27, 0.52],[0.32, 0.27, 0.52],[-0.32, 0.27,-0.52],[0.32, 0.27,-0.52]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]} castShadow><boxGeometry args={[0.26,0.54,0.26]}/><Mat color={color}/></mesh>
      ))}
      {/* Cuerpo */}
      <mesh position={[0,0.82,0]} castShadow><boxGeometry args={[0.88,0.54,1.45]}/><Mat color={color}/></mesh>
      {/* Cuello */}
      <mesh position={[0,1.22,0.5]} castShadow><boxGeometry args={[0.44,0.3,0.44]}/><Mat color={color}/></mesh>
      {/* Cabeza */}
      <mesh position={[0,1.52,0.72]} castShadow><boxGeometry args={[0.74,0.64,0.74]}/><Mat color={color}/></mesh>
      {/* Orejas caídas */}
      {[-0.48,0.48].map((x,i)=>(
        <mesh key={i} position={[x,1.48,0.66]} castShadow><boxGeometry args={[0.16,0.46,0.28]}/><Mat color={color}/></mesh>
      ))}
      {/* Cola */}
      <mesh position={[0,1.05,-0.86]} rotation={[-0.35,0,0]} castShadow><boxGeometry args={[0.14,0.5,0.14]}/><Mat color={color}/></mesh>
    </group>
  );
}

/* ── Gato ───────────────────────────────────────────────── */
function Gato({ color }: { color: string }) {
  return (
    <group scale={[SCALE, SCALE, SCALE]}>
      {[[-0.28,0.27,0.48],[0.28,0.27,0.48],[-0.28,0.27,-0.48],[0.28,0.27,-0.48]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]} castShadow><boxGeometry args={[0.22,0.54,0.22]}/><Mat color={color}/></mesh>
      ))}
      <mesh position={[0,0.82,0]} castShadow><boxGeometry args={[0.78,0.52,1.38]}/><Mat color={color}/></mesh>
      <mesh position={[0,1.18,0.46]} castShadow><boxGeometry args={[0.4,0.28,0.4]}/><Mat color={color}/></mesh>
      <mesh position={[0,1.48,0.64]} castShadow><boxGeometry args={[0.70,0.62,0.70]}/><Mat color={color}/></mesh>
      {/* Orejas puntiagudas */}
      {[-0.3,0.3].map((x,i)=>(
        <mesh key={i} position={[x,1.92,0.64]} castShadow><boxGeometry args={[0.18,0.36,0.12]}/><Mat color={color}/></mesh>
      ))}
      {/* Cola curvada arriba */}
      <mesh position={[0,1.28,-0.80]} rotation={[-0.9,0,0]} castShadow><boxGeometry args={[0.13,0.58,0.13]}/><Mat color={color}/></mesh>
    </group>
  );
}

/* ── Conejo ─────────────────────────────────────────────── */
function Conejo({ color }: { color: string }) {
  return (
    <group scale={[SCALE, SCALE, SCALE]}>
      {[[-0.26,0.22,0.38],[0.26,0.22,0.38],[-0.26,0.22,-0.38],[0.26,0.22,-0.38]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]} castShadow><boxGeometry args={[0.22,0.44,0.22]}/><Mat color={color}/></mesh>
      ))}
      <mesh position={[0,0.76,0]} castShadow><boxGeometry args={[0.84,0.64,1.1]}/><Mat color={color}/></mesh>
      <mesh position={[0,1.26,0.22]} castShadow><boxGeometry args={[0.68,0.60,0.68]}/><Mat color={color}/></mesh>
      {/* Orejas largas */}
      {[-0.22,0.22].map((x,i)=>(
        <mesh key={i} position={[x,1.92,0.18]} castShadow><boxGeometry args={[0.18,0.78,0.14]}/><Mat color={color}/></mesh>
      ))}
      {/* Colita */}
      <mesh position={[0,0.82,-0.64]} castShadow><boxGeometry args={[0.22,0.22,0.22]}/><Mat color={color}/></mesh>
    </group>
  );
}

/* ── Pájaro ─────────────────────────────────────────────── */
function Pajaro({ color }: { color: string }) {
  return (
    <group scale={[SCALE, SCALE, SCALE]}>
      {/* Cuerpo redondo */}
      <mesh position={[0,0.55,0]} castShadow><boxGeometry args={[0.70,0.70,0.90]}/><Mat color={color}/></mesh>
      {/* Cabeza */}
      <mesh position={[0,1.08,0.28]} castShadow><boxGeometry args={[0.58,0.58,0.58]}/><Mat color={color}/></mesh>
      {/* Pico */}
      <mesh position={[0,1.06,0.64]} castShadow><boxGeometry args={[0.18,0.14,0.20]}/><Mat color={color}/></mesh>
      {/* Alas */}
      {[-0.46,0.46].map((x,i)=>(
        <mesh key={i} position={[x,0.6,0]} castShadow><boxGeometry args={[0.22,0.50,0.70]}/><Mat color={color}/></mesh>
      ))}
      {/* Cola */}
      <mesh position={[0,0.44,-0.60]} rotation={[0.3,0,0]} castShadow><boxGeometry args={[0.34,0.14,0.40]}/><Mat color={color}/></mesh>
      {/* Patas */}
      {[-0.16,0.16].map((x,i)=>(
        <mesh key={i} position={[x,0.12,0.1]} castShadow><boxGeometry args={[0.10,0.26,0.10]}/><Mat color={color}/></mesh>
      ))}
    </group>
  );
}

/* ── Hámster ────────────────────────────────────────────── */
function Hamster({ color }: { color: string }) {
  return (
    <group scale={[SCALE * 0.85, SCALE * 0.85, SCALE * 0.85]}>
      {[[-0.26,0.18,0.32],[0.26,0.18,0.32],[-0.26,0.18,-0.32],[0.26,0.18,-0.32]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]} castShadow><boxGeometry args={[0.22,0.36,0.22]}/><Mat color={color}/></mesh>
      ))}
      {/* Cuerpo muy redondo */}
      <mesh position={[0,0.7,0]} castShadow><boxGeometry args={[1.0,0.78,1.1]}/><Mat color={color}/></mesh>
      {/* Cabeza casi igual de ancha */}
      <mesh position={[0,1.22,0.32]} castShadow><boxGeometry args={[0.88,0.70,0.78]}/><Mat color={color}/></mesh>
      {/* Orejas pequeñas */}
      {[-0.38,0.38].map((x,i)=>(
        <mesh key={i} position={[x,1.62,0.28]} castShadow><boxGeometry args={[0.20,0.20,0.14]}/><Mat color={color}/></mesh>
      ))}
      {/* Mejillas */}
      {[-0.46,0.46].map((x,i)=>(
        <mesh key={i} position={[x,1.14,0.34]} castShadow><boxGeometry args={[0.18,0.26,0.28]}/><Mat color={color}/></mesh>
      ))}
    </group>
  );
}

/* ── Tortuga ────────────────────────────────────────────── */
function Tortuga({ color }: { color: string }) {
  return (
    <group scale={[SCALE, SCALE, SCALE]}>
      {/* Patas cortas */}
      {[[-0.46,0.12,0.42],[0.46,0.12,0.42],[-0.46,0.12,-0.42],[0.46,0.12,-0.42]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]} castShadow><boxGeometry args={[0.26,0.24,0.32]}/><Mat color={color}/></mesh>
      ))}
      {/* Panza plana */}
      <mesh position={[0,0.14,0]} castShadow><boxGeometry args={[1.0,0.18,1.3]}/><Mat color={color}/></mesh>
      {/* Caparazón */}
      <mesh position={[0,0.52,0]} castShadow><boxGeometry args={[0.88,0.56,1.1]}/><Mat color={color}/></mesh>
      {/* Cabeza */}
      <mesh position={[0,0.36,0.74]} castShadow><boxGeometry args={[0.40,0.36,0.40]}/><Mat color={color}/></mesh>
      {/* Cola */}
      <mesh position={[0,0.22,-0.72]} castShadow><boxGeometry args={[0.18,0.18,0.24]}/><Mat color={color}/></mesh>
    </group>
  );
}

/* ── Otro (placeholder genérico) ────────────────────────── */
function Otro({ color }: { color: string }) {
  return (
    <group scale={[SCALE, SCALE, SCALE]}>
      <mesh position={[0, 0.7, 0]} castShadow><boxGeometry args={[0.9, 1.4, 0.9]}/><Mat color={color}/></mesh>
      <mesh position={[0, 1.62, 0]} castShadow><boxGeometry args={[0.7, 0.7, 0.7]}/><Mat color={color}/></mesh>
    </group>
  );
}

/* ── Componente principal ───────────────────────────────── */
const PET_COMPONENTS: Record<PetTypeId, React.FC<{ color: string }>> = {
  perro:   Perro,
  gato:    Gato,
  conejo:  Conejo,
  pajaro:  Pajaro,
  hamster: Hamster,
  tortuga: Tortuga,
  otro:    Otro,
};

const PetModel = ({ type, color, position }: PetModelProps) => {
  const Component = PET_COMPONENTS[type] ?? Perro;
  return (
    <group position={position}>
      <Component color={color} />
    </group>
  );
};

export { PetModel };
