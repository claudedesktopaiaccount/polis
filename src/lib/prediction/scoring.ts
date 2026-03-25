/**
 * Prediction scoring — pure functions for evaluating prediction accuracy.
 * Brier-inspired scoring: higher = better.
 */

/** 100 points if predicted winner matches actual, 0 otherwise */
export function scoreWinnerPick(predicted: string, actual: string): number {
  return predicted === actual ? 100 : 0;
}

/** Per-party percentage score: max(0, 50 - (predicted - actual)²) */
export function scorePercentage(predicted: number, actual: number): number {
  const error = predicted - actual;
  return Math.max(0, 50 - error * error);
}

/**
 * Coalition prediction score.
 * 100 if exact match (same set regardless of order).
 * Otherwise: 25 points per correct party, capped at 100.
 */
export function scoreCoalition(predicted: string[], actual: string[]): number {
  if (predicted.length === 0 && actual.length === 0) return 100;
  if (predicted.length === 0 || actual.length === 0) return 0;

  const actualSet = new Set(actual);
  const predictedSet = new Set(predicted);

  // Exact match check (same elements regardless of order)
  if (
    predictedSet.size === actualSet.size &&
    [...predictedSet].every((p) => actualSet.has(p))
  ) {
    return 100;
  }

  // Partial credit: 25 per correct party
  let correct = 0;
  for (const party of predicted) {
    if (actualSet.has(party)) correct++;
  }
  return Math.min(100, correct * 25);
}

/** Sum of all score components */
export function computeTotalScore(
  winner: number,
  percentage: number,
  coalition: number
): number {
  return winner + percentage + coalition;
}
