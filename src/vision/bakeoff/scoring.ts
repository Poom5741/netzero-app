/**
 * Scoring — confusion matrix + per-class precision/recall.
 */

type TruthClass = "flooded" | "dry" | "invalid";
type PredictedClass = "flooded" | "dry" | "invalid";

export interface ClassMetrics {
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
}

export interface ConfusionMatrix {
  flooded: ClassMetrics;
  dry: ClassMetrics;
  invalid: ClassMetrics;
}

interface ScoringPair {
  truth: TruthClass;
  predicted_class: PredictedClass;
}

function emptyMetrics(): ClassMetrics {
  return { tp: 0, fp: 0, fn: 0, precision: 0, recall: 0 };
}

function finalizeMetrics(m: ClassMetrics): ClassMetrics {
  m.precision = m.tp + m.fp === 0 ? 0 : m.tp / (m.tp + m.fp);
  m.recall = m.tp + m.fn === 0 ? 0 : m.tp / (m.tp + m.fn);
  return m;
}

/**
 * Map a ClassifyResult to a 3-class prediction.
 * Invalid photos → "invalid"; valid photos → water_state.
 */
export function resultToClass(result: { valid: boolean; water_state: string }): PredictedClass {
  if (!result.valid) return "invalid";
  if (result.water_state === "flooded") return "flooded";
  if (result.water_state === "dry") return "dry";
  return "invalid";
}

export function computeConfusionMatrix(pairs: ScoringPair[]): ConfusionMatrix {
  const matrix: ConfusionMatrix = {
    flooded: emptyMetrics(),
    dry: emptyMetrics(),
    invalid: emptyMetrics(),
  };

  for (const pair of pairs) {
    const truth = pair.truth;
    const predicted = pair.predicted_class;

    if (truth === predicted) {
      matrix[truth].tp++;
    } else {
      matrix[truth].fn++;
      matrix[predicted].fp++;
    }
  }

  finalizeMetrics(matrix.flooded);
  finalizeMetrics(matrix.dry);
  finalizeMetrics(matrix.invalid);

  return matrix;
}
