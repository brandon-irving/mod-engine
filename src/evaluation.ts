import type {
  ConfigSpec,
  ItemSpec,
  Modifier,
  EvaluationResult,
  ModifierApplication,
  MetricOf,
  EvalContext,
} from "./types.js";
import { EvaluationError } from "./errors.js";
import { evaluateCondition } from "./conditions.js";
import type { OperationInfo } from "./operations.js";

/**
 * Evaluates an item specification and returns the computed metrics
 */
export function evaluateItem<C extends ConfigSpec>(
  item: ItemSpec<C>,
  operations: Map<string, OperationInfo<C>>,
  config: C,
  baseMetrics?: Partial<Record<MetricOf<C>, number>>
): EvaluationResult<C> {
  try {
    // Initialize metrics to 0 or provided base values
    const metrics = {} as Record<MetricOf<C>, number>;
    for (const metric of config.metrics) {
      metrics[metric as MetricOf<C>] =
        baseMetrics?.[metric as MetricOf<C>] ?? 0;
    }

    // Filter modifiers by conditions and apply stacking rules
    const applicableModifiers = filterAndStackModifiers(item);

    // Sort modifiers by priority and operation precedence
    const sortedModifiers = sortModifiers(applicableModifiers, operations);

    // Apply modifiers in order and track applications
    const applied: ModifierApplication<C>[] = [];

    for (const modifier of sortedModifiers) {
      const application = applyModifier(
        modifier,
        metrics,
        operations,
        item
      );
      if (application) {
        applied.push(application);
      }
    }

    return {
      metrics,
      applied,
    };
  } catch (error) {
    throw new EvaluationError(
      `Evaluation failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Filters modifiers by conditions and applies stacking rules
 */
function filterAndStackModifiers<C extends ConfigSpec>(
  item: ItemSpec<C>
): Modifier<C>[] {
  // First filter by conditions
  const validModifiers = item.modifiers.filter((modifier) => {
    if (!modifier.conditions) {
      return true;
    }

    try {
      return evaluateCondition(modifier.conditions, item.attributes);
    } catch {
      // If condition evaluation fails, skip the modifier
      return false;
    }
  });

  // Apply stacking rules
  return applyStackingRules(validModifiers);
}

/**
 * Applies stacking rules to remove/merge conflicting modifiers
 */
function applyStackingRules<C extends ConfigSpec>(
  modifiers: readonly Modifier<C>[]
): Modifier<C>[] {
  const result: Modifier<C>[] = [];
  const uniqueGroups = new Map<string, Modifier<C>[]>();

  for (const modifier of modifiers) {
    const stacking = modifier.stacking || "stack";

    if (stacking === "stack") {
      // Stack always - just add to result
      result.push(modifier);
    } else if (stacking === "unique") {
      // Group by metric + operation + source
      const source = modifier.source || "";
      const groupKey = `${modifier.metric}:${modifier.operation}:${source}`;

      if (!uniqueGroups.has(groupKey)) {
        uniqueGroups.set(groupKey, []);
      }
      uniqueGroups.get(groupKey)!.push(modifier);
    } else if (typeof stacking === "object" && "uniqueBy" in stacking) {
      // Group by custom key
      const groupKey = stacking.uniqueBy;

      if (!uniqueGroups.has(groupKey)) {
        uniqueGroups.set(groupKey, []);
      }
      uniqueGroups.get(groupKey)!.push(modifier);
    }
  }

  // Process unique groups - pick the best modifier from each group
  for (const group of Array.from(uniqueGroups.values())) {
    if (group.length === 1) {
      result.push(group[0]!);
    } else {
      // Pick the modifier with highest absolute effect
      // Tie-break by priority (higher first), then by insertion order
      const best = group.reduce((best, current) => {
        const bestAbsValue = Math.abs(best.value);
        const currentAbsValue = Math.abs(current.value);

        if (currentAbsValue > bestAbsValue) {
          return current;
        } else if (currentAbsValue === bestAbsValue) {
          const bestPriority = best.priority ?? 0;
          const currentPriority = current.priority ?? 0;

          if (currentPriority > bestPriority) {
            return current;
          } else if (currentPriority === bestPriority) {
            // Keep the first one (stable order)
            return best;
          }
        }

        return best;
      });

      result.push(best);
    }
  }

  return result;
}

/**
 * Sorts modifiers by priority and operation precedence
 */
function sortModifiers<C extends ConfigSpec>(
  modifiers: Modifier<C>[],
  operations: Map<string, OperationInfo<C>>
): Modifier<C>[] {
  return [...modifiers].sort((a, b) => {
    // First sort by priority (higher first)
    const aPriority = a.priority ?? 0;
    const bPriority = b.priority ?? 0;

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    // Then by operation precedence (higher first)
    const aOp = operations.get(a.operation);
    const bOp = operations.get(b.operation);
    const aPrecedence = aOp?.precedence ?? 0;
    const bPrecedence = bOp?.precedence ?? 0;

    if (aPrecedence !== bPrecedence) {
      return bPrecedence - aPrecedence;
    }

    // Finally maintain stable order (already sorted by insertion order)
    return 0;
  });
}

/**
 * Applies a single modifier to the metrics
 */
function applyModifier<C extends ConfigSpec>(
  modifier: Modifier<C>,
  metrics: Record<MetricOf<C>, number>,
  operations: Map<string, OperationInfo<C>>,
  item: ItemSpec<C>
): ModifierApplication<C> | null {
  const operationInfo = operations.get(modifier.operation);

  if (!operationInfo) {
    throw new EvaluationError(`Unknown operation: ${modifier.operation}`);
  }

  const currentValue = metrics[modifier.metric];

  // Create evaluation context
  const context: EvalContext<C> = {
    item,
    modifier,
    currentMetrics: { ...metrics },
  };

  try {
    // Apply the operation
    const newValue = operationInfo.impl(currentValue, modifier.value, context);

    // Validate the result
    if (!Number.isFinite(newValue)) {
      throw new EvaluationError(
        `Operation ${modifier.operation} produced invalid result: ${newValue}`
      );
    }

    // Update the metric
    metrics[modifier.metric] = newValue;

    return {
      modifier,
      appliedValue: modifier.value,
      before: currentValue,
      after: newValue,
      resultingValue: newValue,
    };
  } catch (error) {
    throw new EvaluationError(
      `Failed to apply modifier ${modifier.operation} to ${modifier.metric}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Creates a snapshot of current metrics for immutability
 */
export function createMetricsSnapshot<C extends ConfigSpec>(
  metrics: Record<MetricOf<C>, number>
): Record<MetricOf<C>, number> {
  return { ...metrics };
}

/**
 * Validates that all metrics in the config are present in the result
 */
export function validateMetricsCompleteness<C extends ConfigSpec>(
  metrics: Record<string, number>,
  config: C
): void {
  for (const metric of config.metrics) {
    if (!(metric in metrics)) {
      throw new EvaluationError(`Missing metric in result: ${metric}`);
    }
  }
}
