export interface Region {
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
}

export const DEFAULT_REGIONS: Region[] = [
  { name: 'header', bounds: { x: 0, y: 0, width: 1, height: 0.1 } },
  { name: 'sidebar', bounds: { x: 0, y: 0.1, width: 0.2, height: 0.82 } },
  { name: 'content', bounds: { x: 0.2, y: 0.1, width: 0.8, height: 0.82 } },
  { name: 'footer', bounds: { x: 0, y: 0.92, width: 1, height: 0.08 } },
];

export function getRegionBounds(
  region: Region,
  imageWidth: number,
  imageHeight: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: Math.floor(region.bounds.x * imageWidth),
    y: Math.floor(region.bounds.y * imageHeight),
    width: Math.floor(region.bounds.width * imageWidth),
    height: Math.floor(region.bounds.height * imageHeight),
  };
}
