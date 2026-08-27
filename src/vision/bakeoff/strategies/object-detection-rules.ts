/**
 * Object detection rules strategy - heuristic-based pipe and water detection
 * No API calls, completely free
 */
import { Jimp } from "jimp";
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";

export const objectDetectionRules: ClassifierBinding = {
  latencyMs: 150,
  costPerCall: 0,

  async classify(image: LabeledImage): Promise<ClassifyResult> {
    try {
      const jimpImage = await Jimp.read(Buffer.from(image.bytes));
      const { width, height } = jimpImage.bitmap;

      // Step 1: Detect pipe (circular object with specific characteristics)
      const pipeDetection = detectPipeStructure(jimpImage);

      if (!pipeDetection.found) {
        return {
          valid: false,
          water_state: "not-applicable",
          confidence: 0.8,
          reason: "ไม่พบโครงสร้างท่อในภาพ"
        };
      }

      // Step 2: Analyze water presence around pipe
      const waterAnalysis = analyzeWaterRegion(jimpImage, pipeDetection.center);

      // Step 3: Check for common invalid photo patterns
      const invalidCheck = checkInvalidPatterns(jimpImage);

      if (invalidCheck.isInvalid) {
        return {
          valid: false,
          water_state: "not-applicable",
          confidence: invalidCheck.confidence,
          reason: invalidCheck.reason
        };
      }

      // Step 4: Classify based on water analysis
      if (waterAnalysis.hasWater) {
        return {
          valid: true,
          water_state: "flooded",
          confidence: waterAnalysis.confidence,
          reason: `พบน้ำขังรอบท่อ (${(waterAnalysis.waterRatio * 100).toFixed(1)}% ของพื้นที่)`
        };
      } else {
        return {
          valid: true,
          water_state: "dry",
          confidence: waterAnalysis.confidence,
          reason: "ไม่พบน้ำขังรอบท่อ"
        };
      }
    } catch (error) {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0,
        reason: `Object detection failed: ${error.message}`
      };
    }
  }
};

interface PipeDetection {
  found: boolean;
  center: { x: number; y: number };
  radius: number;
  confidence: number;
}

/**
 * Detect pipe structure using circular edge detection
 */
function detectPipeStructure(image: any): PipeDetection {
  const { width, height } = image.bitmap;

  // Look for circular patterns (pipes are typically circular)
  let bestCircle = { x: 0, y: 0, radius: 0, score: 0 };

  // Sample different potential pipe locations and sizes
  for (let cy = height * 0.3; cy < height * 0.7; cy += 20) {
    for (let cx = width * 0.3; cx < width * 0.7; cx += 20) {
      for (let r = 30; r < Math.min(width, height) * 0.3; r += 10) {
        const score = evaluateCircle(image, cx, cy, r);
        if (score > bestCircle.score) {
          bestCircle = { x: cx, y: cy, radius: r, score };
        }
      }
    }
  }

  // If we found a reasonable circle, it's likely a pipe
  if (bestCircle.score > 0.5) {
    return {
      found: true,
      center: { x: bestCircle.x, y: bestCircle.y },
      radius: bestCircle.radius,
      confidence: Math.min(0.95, bestCircle.score)
    };
  }

  return { found: false, center: { x: 0, y: 0 }, radius: 0, confidence: 0 };
}

/**
 * Evaluate how well a circle matches pipe characteristics
 */
function evaluateCircle(image: any, cx: number, cy: number, radius: number): number {
  const { width, height } = image.bitmap;
  let edgeScore = 0;
  let colorConsistency = 0;
  let samples = 0;

  // Check circular edge
  for (let angle = 0; angle < 360; angle += 10) {
    const rad = (angle * Math.PI) / 180;
    const x = Math.round(cx + radius * Math.cos(rad));
    const y = Math.round(cy + radius * Math.sin(rad));

    if (x >= 0 && x < width && y >= 0 && y < height) {
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;

      // Pipes often have metallic colors (gray/silver)
      const isMetallic = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r > 100;
      if (isMetallic) colorConsistency++;
      samples++;
    }
  }

  return samples > 0 ? colorConsistency / samples : 0;
}

interface WaterAnalysis {
  hasWater: boolean;
  waterRatio: number;
  confidence: number;
}

/**
 * Analyze water presence around the detected pipe
 */
function analyzeWaterRegion(image: any, center: { x: number; y: number }): WaterAnalysis {
  const { width, height } = image.bitmap;
  const searchRadius = Math.min(width, height) * 0.4;

  let waterPixels = 0;
  let totalPixels = 0;

  // Analyze region around pipe
  for (let y = Math.max(0, center.y - searchRadius); y < Math.min(height, center.y + searchRadius); y += 2) {
    for (let x = Math.max(0, center.x - searchRadius); x < Math.min(width, center.x + searchRadius); x += 2) {
      const dist = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
      if (dist <= searchRadius) {
        const color = image.getPixelColor(x, y);
        const r = (color >> 24) & 255;
        const g = (color >> 16) & 255;
        const b = (color >> 8) & 255;

        totalPixels++;

        // Water detection: blue-ish, dark, reflective
        const isWater = (b > r && b > g && b > 80) ||
                       (r < 100 && g < 100 && b > 100) || // Dark water
                       (r > 150 && g > 150 && b > 200); // Reflective water

        if (isWater) waterPixels++;
      }
    }
  }

  const waterRatio = totalPixels > 0 ? waterPixels / totalPixels : 0;
  const hasWater = waterRatio > 0.2; // At least 20% water coverage

  return {
    hasWater,
    waterRatio,
    confidence: hasWater ? Math.min(0.95, 0.7 + waterRatio) : Math.min(0.95, 0.7 + (1 - waterRatio) * 0.5)
  };
}

interface InvalidCheck {
  isInvalid: boolean;
  confidence: number;
  reason: string;
}

/**
 * Check for common invalid photo patterns
 */
function checkInvalidPatterns(image: any): InvalidCheck {
  const { width, height } = image.bitmap;

  // Check 1: Too dark (photo taken in poor lighting)
  let totalBrightness = 0;
  let pixels = 0;

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;
      totalBrightness += (r + g + b) / 3;
      pixels++;
    }
  }

  const avgBrightness = totalBrightness / pixels;
  if (avgBrightness < 50) {
    return {
      isInvalid: true,
      confidence: 0.9,
      reason: "ภาพมืดเกินไป ไม่สามารถวิเคราะห์ได้"
    };
  }

  // Check 2: Too uniform (blank photo or wrong subject)
  let colorVariance = 0;
  const colors: number[] = [];

  for (let y = 0; y < height; y += 8) {
    for (let x = 0; x < width; x += 8) {
      colors.push(image.getPixelColor(x, y));
    }
  }

  const avgColor = colors.reduce((sum, c) => sum + c, 0) / colors.length;
  for (const c of colors) {
    colorVariance += Math.abs(c - avgColor);
  }
  colorVariance /= colors.length;

  if (colorVariance < 1000) {
    return {
      isInvalid: true,
      confidence: 0.85,
      reason: "ภาพไม่มีความชัดเจนหรือเป็นภาพเปล่า"
    };
  }

  return { isInvalid: false, confidence: 0, reason: "" };
}
