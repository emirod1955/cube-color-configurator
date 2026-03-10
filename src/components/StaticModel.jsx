import { useGLTF } from '@react-three/drei';

const StaticModel = ({ path, position = [0, 0, 0], scale = [1, 1, 1] }) => {
  const { scene } = useGLTF(path);
  return <primitive object={scene} position={position} scale={scale} />;
};

export { StaticModel };
