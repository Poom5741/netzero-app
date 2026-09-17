import { webcrypto } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface CaptureProvenance {
  artifactId: string;
  screenName: string;
  stateName: string;
  sourceModule?: string;
  captureKind: "source-reference" | "implementation";
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  fixtureId: string;
  fontState: "ready" | "timeout";
  assetStatus: "ready" | "missing" | "blocked";
  captureTimestamp: string;
  sourceHash: string;
  captureTool: string;
  noiseProfileId: string;
}

export interface ProvenanceOptions {
  artifactId: string;
  screenName: string;
  stateName: string;
  sourceModule?: string;
  captureKind: "source-reference" | "implementation";
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  fixtureId: string;
  fontState: "ready" | "timeout";
  assetStatus: "ready" | "missing" | "blocked";
  sourceHash: string;
  noiseProfileId?: string;
}

export async function computeSourceHash(html: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(html);
  const hashBuffer = await webcrypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateProvenance(options: ProvenanceOptions): CaptureProvenance {
  return {
    artifactId: options.artifactId,
    screenName: options.screenName,
    stateName: options.stateName,
    sourceModule: options.sourceModule,
    captureKind: options.captureKind,
    viewport: options.viewport,
    deviceScaleFactor: options.deviceScaleFactor,
    fixtureId: options.fixtureId,
    fontState: options.fontState,
    assetStatus: options.assetStatus,
    captureTimestamp: new Date().toISOString(),
    sourceHash: options.sourceHash,
    captureTool: "playwright",
    noiseProfileId: options.noiseProfileId ?? "",
  };
}

export function writeProvenance(provenance: CaptureProvenance, outputDir: string): string {
  const provenanceDir = join(outputDir, "provenance");
  mkdirSync(provenanceDir, { recursive: true });
  const filename = `${provenance.screenName}-${provenance.stateName}-${provenance.viewport.width}x${provenance.viewport.height}.json`;
  const filePath = join(provenanceDir, filename);
  writeFileSync(filePath, JSON.stringify(provenance, null, 2));
  return filePath;
}

export interface ProvenanceRecord {
  screenName: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  capturedAt: string;
  sourceUrl: string;
  outputPath: string;
  checksum?: string;
}

export function saveProvenance(record: ProvenanceRecord, outputDir: string): string {
  const provenanceDir = join(outputDir, "provenance");
  mkdirSync(provenanceDir, { recursive: true });
  const filename = `${record.screenName}-${record.viewport.width}x${record.viewport.height}.json`;
  const outputPath = join(provenanceDir, filename);
  writeFileSync(outputPath, JSON.stringify(record, null, 2));
  return outputPath;
}

export function loadProvenance(provenancePath: string): ProvenanceRecord {
  const content = require("node:fs").readFileSync(provenancePath, "utf-8");
  return JSON.parse(content);
}
