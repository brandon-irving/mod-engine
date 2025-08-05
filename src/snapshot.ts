import type { ConfigSpec, ItemSpec, MetricOf, Attributes } from "./types.js";
import type { Engine } from "./config";

/**
 * Creates a flat, computed representation combining evaluated metrics and attributes.
 *
 * This helper produces a predictable shape that's useful for:
 * - API responses and database storage
 * - Frontend state management
 * - Analytics and reporting
 * - Caching computed results
 * - Testing and debugging
 * - Data export/import (CSV, JSON)
 * - External integrations
 *
 * @param engine - The engine to use for evaluation
 * @param item - The item specification to evaluate
 * @param baseStats - Optional base metric values to start from
 * @returns Flat object with name, computed metrics, and all attributes
 */

export function toSnapshot<C extends ConfigSpec>(
  engine: Engine<C>,
  item: ItemSpec<C>,
  baseStats?: Partial<Record<MetricOf<C>, number>>
): {
  readonly name: string;
  readonly metrics: Record<MetricOf<C>, number>;
} & Attributes<C> {
  const evaluation = engine.evaluate(item, { base: baseStats });

  return {
    name: item.name || "Unknown",
    metrics: evaluation.metrics,
    ...item.attributes,
  } as const;
}
