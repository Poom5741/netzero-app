/**
 * D17 pass bar: ≤2% bad-slip AND ≥70% auto-pass.
 */

export interface PassBarVerdict {
  passed: boolean;
  reason: string;
}

export function checkPassBar(input: {
  badSlipRate: number;
  autoPassRate: number;
}): PassBarVerdict {
  const reasons: string[] = [];

  if (input.badSlipRate > 0.02) {
    reasons.push(`bad-slip ${(input.badSlipRate * 100).toFixed(1)}% > 2%`);
  }
  if (input.autoPassRate < 0.7) {
    reasons.push(`auto-pass ${(input.autoPassRate * 100).toFixed(1)}% < 70%`);
  }

  return {
    passed: reasons.length === 0,
    reason: reasons.join("; "),
  };
}
