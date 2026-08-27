/**
 * Issue #123 — Auto-verify rule evaluator.
 * Decides whether to auto-verify, auto-reject, or queue for admin based on
 * CLIP confidence and farmer trust score.
 */

export type AutoVerifyDecision = "auto_verify" | "auto_reject" | "queue_for_admin";

export interface AutoVerifyInput {
  confidence: number; // 0-1 from CLIP
  trustScore: number; // 0-1 from farmer trust
  valid: boolean; // from CLIP classification
}

export interface AutoVerifyResult {
  decision: AutoVerifyDecision;
  reason: string;
}

/**
 * Evaluate auto-verify rules.
 * 
 * Rules:
 * - High confidence (>0.85) + high trust (>0.7) → auto_verify
 * - Low confidence (<0.4) OR low trust (<0.3) → auto_reject
 * - Otherwise → queue_for_admin
 */
export function evaluateAutoVerify(input: AutoVerifyInput): AutoVerifyResult {
  const { confidence, trustScore, valid } = input;

  // Auto-reject: very low confidence or untrusted farmer with low confidence
  if (confidence < 0.4 || (trustScore < 0.3 && confidence < 0.6)) {
    return {
      decision: "auto_reject",
      reason: `Low confidence (${confidence.toFixed(2)}) or low trust (${trustScore.toFixed(2)})`,
    };
  }

  // Auto-verify: high confidence + high trust
  if (confidence > 0.85 && trustScore > 0.7 && valid) {
    return {
      decision: "auto_verify",
      reason: `High confidence (${confidence.toFixed(2)}) and high trust (${trustScore.toFixed(2)})`,
    };
  }

  // Queue for admin: everything else
  return {
    decision: "queue_for_admin",
    reason: `Moderate confidence (${confidence.toFixed(2)}) or trust (${trustScore.toFixed(2)})`,
  };
}
