/**
 * Traditional CV strategy - pure JavaScript color analysis
 * No API calls, completely free
 */
import { Jimp } from "jimp";
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";

export const traditionalCV: ClassifierBinding = {
  latencyMs: 50,
  costPerCall: 0,

  async classify(image: LabeledImage): Promise<ClassifyResult> {
    try {
      // Load image
      const jimpImage = await Jimp.read(Buffer.from(image.bytes));
      const { width, height } = jimpImage.bitmap;

      // Analyze color distribution
      let bluePixels = 0;
      let brownPixels = 0;
      let greenPixels = 0;
      let totalPixels = 0;

      for (let y = 0; y < height; y += 4) { // Sample every 4th pixel for speed
        for (let x = 0; x < width; x += 4) {
          const color = jimpImage.getPixelColor(x, y);
          const r = (color >> 24) & 255;
          const g = (color >> 16) & 255;
          const b = (color >> 8) & 255;

          totalPixels++;

          // Water detection: blue-ish colors
          if (b > r && b > g && b > 100) {
            bluePixels++;
          }
          // Dry soil: brown/tan colors
          else if (r > g && g > b && r > 100 && r < 200) {
            brownPixels++;
          }
          // Vegetation: green colors
          else if (g > r && g > b && g > 80) {
            greenPixels++;
          }
        }
      }

      const blueRatio = bluePixels / totalPixels;
      const brownRatio = brownPixels / totalPixels;
      const greenRatio = greenPixels / totalPixels;

      // Check for pipe detection (circular shapes with high contrast)
      const hasPipe = detectPipe(jimpImage);

      // Decision logic
      if (!hasPipe) {
        return {
          valid: false,
          water_state: "not-applicable",
          confidence: 0.7,
          reason: "ไม่พบท่อวัดในภาพ"
        };
      }

      // Classify water state based on color ratios
      if (blueRatio > 0.3) {
        return {
          valid: true,
          water_state: "flooded",
          confidence: Math.min(0.95, 0.7 + blueRatio),
          reason: "พบน้ำขังรอบท่อ"
        };
      } else if (brownRatio > 0.4 && blueRatio < 0.1) {
        return {
          valid: true,
          water_state: "dry",
          confidence: Math.min(0.95, 0.7 + brownRatio * 0.5),
          reason: "ดินแห้งรอบท่อ"
        };
      } else {
        // Uncertain - default to dry with lower confidence
        return {
          valid: true,
          water_state: "dry",
          confidence: 0.5,
          reason: "ไม่สามารถระบุสถานะน้ำได้อย่างชัดเจน"
        };
      }
    } catch (error) {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0,
        reason: `CV analysis failed: ${error.message}`
      };
    }
  }
};

/**
 * Simple pipe detection using edge detection
 */
function detectPipe(image: any): boolean {
  const { width, height } = image.bitmap;
  let edgeCount = 0;
  const threshold = 50;

  // Look for circular edges (pipe outline)
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
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

      // Detect strong edges
      if (Math.abs(centerR - topR) > threshold ||
          Math.abs(centerR - bottomR) > threshold ||
          Math.abs(centerR - leftR) > threshold ||
          Math.abs(centerR - rightR) > threshold) {
        edgeCount++;
      }
    }
  }

  // If we found enough edges, assume there's a pipe
  const edgeDensity = edgeCount / ((width / 2) * (height / 2));
  return edgeDensity > 0.05; // At least 5% edge density
}
