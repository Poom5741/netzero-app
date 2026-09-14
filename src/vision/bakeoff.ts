/** Shared manifest types for learned vision strategies. */
export type PipeLabel = "flooded" | "dry" | "invalid";

export interface BakeoffEntry {
  path: string;
  label: PipeLabel;
}

export interface BakeoffManifest {
  images: BakeoffEntry[];
}
