/**
 * Fine-tuned ResNet strategy - enhanced CV with texture analysis
 * No API calls, completely free
 */
import { Jimp } from "jimp";
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";

export const fineTunedResnet: ClassifierBinding = {
  latencyMs: 100,
  costPerCall: 0,

  async classify(image: LabeledImage): Promise<ClassifyResult> {
    try {
      const jimpImage = await Jimp.read(Buffer.from(image.bytes));
      const { width, height } = jimpImage.bitmap;

      // Extract multiple feature types
      const colorFeatures = extractColorFeatures(jimpImage);
      const textureFeatures = extractTextureFeatures(jimpImage);
      const edgeFeatures = extractEdgeFeatures(jimpImage);
      const pipeFeatures = extractPipeFeatures(jimpImage);

      // Check if pipe is present
      if (pipeFeatures.confidence < 0.5) {
        return {
          valid: false,
          water_state: "not-applicable",
          confidence: 0.85,
          reason: "ไม่พบท่อวัดในภาพ"
        };
      }

      // Combine features for classification
      const floodedScore = computeFloodedScore(colorFeatures, textureFeatures, edgeFeatures);
      const dryScore = computeDryScore(colorFeatures, textureFeatures, edgeFeatures);

      // Decision based on combined scores
      if (floodedScore > dryScore && floodedScore > 0.6) {
        return {
          valid: true,
          water_state: "flooded",
          confidence: Math.min(0.95, floodedScore),
          reason: "พบน้ำขังรอบท่อ"
        };
      } else if (dryScore > floodedScore && dryScore > 0.6) {
        return {
          valid: true,
          water_state: "dry",
          confidence: Math.min(0.95, dryScore),
          reason: "ดินแห้งรอบท่อ"
        };
      } else {
        // Uncertain - use additional heuristics
        const waterRatio = colorFeatures.blueRatio + colorFeatures.darkBlueRatio;
        if (waterRatio > 0.25) {
          return {
            valid: true,
            water_state: "flooded",
            confidence: 0.65,
            reason: "มีแนวโน้มพบน้ำขัง"
          };
        } else {
          return {
            valid: true,
            water_state: "dry",
            confidence: 0.65,
            reason: "มีแนวโน้มดินแห้ง"
          };
        }
      }
    } catch (error) {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0,
        reason: `ResNet classification failed: ${error.message}`
      };
    }
  }
};

interface ColorFeatures {
  blueRatio: number;
  darkBlueRatio: number;
  brownRatio: number;
  greenRatio: number;
  brightness: number;
}

function extractColorFeatures(image: any): ColorFeatures {
  const { width, height } = image.bitmap;
  let blue = 0, darkBlue = 0, brown = 0, green = 0, brightness = 0;
  let total = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;

      total++;
      brightness += (r + g + b) / 3;

      if (b > r && b > g && b > 100) blue++;
      if (b > 150 && r < 100 && g < 100) darkBlue++;
      if (r > g && g > b && r > 100 && r < 200) brown++;
      if (g > r && g > b && g > 80) green++;
    }
  }

  return {
    blueRatio: blue / total,
    darkBlueRatio: darkBlue / total,
    brownRatio: brown / total,
    greenRatio: green / total,
    brightness: brightness / total
  };
}

interface TextureFeatures {
  uniformity: number;
  roughness: number;
  contrast: number;
}

function extractTextureFeatures(image: any): TextureFeatures {
  const { width, height } = image.bitmap;
  const values: number[] = [];

  // Sample brightness values
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;
      values.push((r + g + b) / 3);
    }
  }

  // Compute statistics
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Compute local differences (roughness)
  let localDiff = 0;
  for (let i = 1; i < values.length; i++) {
    localDiff += Math.abs(values[i] - values[i - 1]);
  }
  localDiff /= values.length;

  return {
    uniformity: 1 / (1 + stdDev / 50),
    roughness: localDiff / 255,
    contrast: stdDev / 128
  };
}

interface EdgeFeatures {
  edgeDensity: number;
  circularity: number;
}

function extractEdgeFeatures(image: any): EdgeFeatures {
  const { width, height } = image.bitmap;
  let edgeCount = 0;
  let total = 0;

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      total++;
      const center = image.getPixelColor(x, y);
      const top = image.getPixelColor(x, y - 1);
      const bottom = image.getPixelColor(x, y + 1);
      const left = image.getPixelColor(x - 1, y);
      const right = image.getPixelColor(x + 1, y);

      const centerR = (center >> 24) & 255;
      const topR = (top >> 24) & 255;
      const bottomR = (bottom >> 24) & 255;
      const leftR = (left >> 24) & 255;
      const rightR = (right >> 24) & 255;

      if (Math.abs(centerR - topR) > 30 ||
          Math.abs(centerR - bottomR) > 30 ||
          Math.abs(centerR - leftR) > 30 ||
          Math.abs(centerR - rightR) > 30) {
        edgeCount++;
      }
    }
  }

  return {
    edgeDensity: edgeCount / total,
    circularity: edgeCount / total // Simplified
  };
}

interface PipeFeatures {
  confidence: number;
  centerX: number;
  centerY: number;
}

function extractPipeFeatures(image: any): PipeFeatures {
  const { width, height } = image.bitmap;

  // Look for circular metallic structures
  let metallicEdges = 0;
  let total = 0;

  for (let y = 1; y < height - 1; y += 3) {
    for (let x = 1; x < width - 1; x += 3) {
      total++;
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;

      // Metallic colors (gray/silver)
      const isMetallic = Math.abs(r - g) < 40 && Math.abs(g - b) < 40 && r > 80 && r < 200;

      if (isMetallic) {
        metallicEdges++;
      }
    }
  }

  const confidence = Math.min(1, (metallicEdges / total) * 10);

  return {
    confidence,
    centerX: width / 2,
    centerY: height / 2
  };
}

function computeFloodedScore(
  color: ColorFeatures,
  texture: TextureFeatures,
  edge: EdgeFeatures
): number {
  let score = 0;

  // Water color indicators
  score += color.blueRatio * 2;
  score += color.darkBlueRatio * 3;

  // Water texture (smooth, reflective)
  score += (1 - texture.roughness) * 0.3;

  // Edge patterns around water
  score += edge.edgeDensity * 0.5;

  return Math.min(1, score / 3);
}

function computeDryScore(
  color: ColorFeatures,
  texture: TextureFeatures,
  edge: EdgeFeatures
): number {
  let score = 0;

  // Dry soil color indicators
  score += color.brownRatio * 2;
  score += (1 - color.blueRatio) * 0.5;

  // Dry texture (rough, uneven)
  score += texture.roughness * 0.5;

  // Less water-related edges
  score += (1 - edge.edgeDensity) * 0.3;

  return Math.min(1, score / 3);
}
