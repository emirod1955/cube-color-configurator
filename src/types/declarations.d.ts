declare module "*.svg" {
  const content: { src: string; width: number; height: number } | string;
  export default content;
}

declare module "*.jpg" {
  const content: { src: string; width: number; height: number } | string;
  export default content;
}

declare module "*.png" {
  const content: { src: string; width: number; height: number } | string;
  export default content;
}
