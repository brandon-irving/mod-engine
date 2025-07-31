import type { AppliedTrace, EvaluationResult, ConfigSpec } from "./types.js";

/**
 * Transforms an EvaluationResult into a stable "AppliedTrace" shape that is
 * convenient for debugging and UI consumption. No additional computation is
 * performed – the function only maps existing data.
 */
export function explainEvaluation<C extends ConfigSpec>(
  result: EvaluationResult<C>
): AppliedTrace<C>[] {
  return result.applied.map((app) => {
    const { modifier, before, after } = app;
    return {
      metric: modifier.metric,
      operation: modifier.operation,
      value: modifier.value,
      before,
      after,
      priority: modifier.priority,
      source: modifier.source,
      conditionMatched: true, // Only matched modifiers are included in EvaluationResult
    } as AppliedTrace<C>;
  });
}
