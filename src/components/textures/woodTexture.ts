import * as THREE from "three";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import woodUrl from "../../../public/wood.jpg";

export const useWoodTexture = (): THREE.Texture => {
  const url = typeof woodUrl === 'string' ? woodUrl : (woodUrl as unknown as { src: string }).src;
  const texture = useLoader(TextureLoader, url);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
};
