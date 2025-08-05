/**
 * RPG SDK Helpers
 * Utility functions for working with the RPG mod engine
 */

import type { ItemSpec, EvaluationResult } from "mod-engine";
import type { ModifierForm, ItemState, AttributeKey } from "./types";
import { rpgEngine, rpgConfig, type RpgConfig } from "./config";
import { createConditionBuilder, type Condition } from "mod-engine";
import { ATTRIBUTE_DEFINITIONS, DEFAULT_BASE_METRICS } from "./constants";

/**
 * Create a new modifier with default values
 */
export function createModifier(
  partial: Partial<ModifierForm> = {}
): ModifierForm {
  return {
    id: crypto.randomUUID(),
    metric: "Health",
    operation: "sum",
    value: 10,
    priority: 10,
    hasCondition: false,
    stacking: "default",
    ...partial,
  };
}

/**
 * Evaluate an item with the RPG engine using default base metrics
 */
export function evaluateItem(
  item: ItemSpec<RpgConfig>
): EvaluationResult<RpgConfig> {
  return rpgEngine.evaluate(item, { base: DEFAULT_BASE_METRICS });
}

/**
 * Build an item from state and modifiers
 */
export function buildItem(
  itemState: ItemState,
  modifiers: ModifierForm[]
): ItemSpec<RpgConfig> {
  let builder = rpgEngine
    .builder(itemState.itemName)
    .set("ItemName", itemState.itemName)
    .set("Rarity", itemState.rarity)
    .set("Tags", itemState.tags)
    .set("Level", itemState.level)
    .set("Enchanted", itemState.enchanted)
    .set("Quality", itemState.quality)
    .set("Cursed", itemState.cursed)
    .set("SocketCount", itemState.socketCount);

  // Add modifiers
  modifiers.forEach((mod) => {
    if (mod.hasCondition && mod.condition) {
      builder = builder.when(
        makeCondition(
          mod.condition.operation as ConditionOp,
          mod.condition.attribute,
          mod.condition.value
        )
      );
    }

    if (mod.stacking === "unique" && mod.source) {
      builder = builder.with({
        priority: mod.priority,
        stacking: "unique",
        source: mod.source,
      });
    } else {
      builder = builder.with({ priority: mod.priority });
    }

    if (mod.operation === "sum") {
      builder = builder.increase(mod.metric).by(mod.value);
    } else if (mod.operation === "subtract") {
      builder = builder.decrease(mod.metric).by(mod.value);
    } else if (mod.operation === "multiply") {
      builder = builder.multiply(mod.metric).by(mod.value);
    }
  });

  return builder.build();
}

// --------------------------------------------------
// Condition helper – fully typed
// --------------------------------------------------

const conditionBuilder = createConditionBuilder<typeof rpgConfig>();

export type ConditionOp =
  | "eq"
  | "in"
  | "includes"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

export function makeCondition<K extends AttributeKey>(
  op: ConditionOp,
  attr: K,
  value: any
): Condition<RpgConfig> {
  switch (op) {
    case "eq":
      return conditionBuilder.eq(attr, value);
    case "in":
      return conditionBuilder.in(attr, value);
    case "includes":
      return conditionBuilder.includes(attr, value);
    case "gt":
    case "gte":
    case "lt":
    case "lte":
      return conditionBuilder[op](attr, value);
    default:
      throw new Error(`Unsupported condition op: ${op}`);
  }
}

/**
 * Validate a modifier form
 */
export function validateModifier(modifier: ModifierForm): string[] {
  const errors: string[] = [];

  if (!modifier.metric) {
    errors.push("Metric is required");
  }

  if (!modifier.operation) {
    errors.push("Operation is required");
  }

  if (typeof modifier.value !== "number" || isNaN(modifier.value)) {
    errors.push("Value must be a valid number");
  }

  if (modifier.hasCondition && modifier.condition) {
    if (!modifier.condition.attribute) {
      errors.push("Condition attribute is required");
    }
    if (!modifier.condition.operation) {
      errors.push("Condition operation is required");
    }
    if (
      modifier.condition.value === undefined ||
      modifier.condition.value === ""
    ) {
      errors.push("Condition value is required");
    }
  }

  return errors;
}

/**
 * Get default value for an attribute based on its type
 */
export function getDefaultValueForAttribute(
  attribute: AttributeKey
): string | number | boolean | string[] {
  const attrType = ATTRIBUTE_DEFINITIONS[attribute];
  if (!attrType) return "";

  switch (attrType.kind) {
    case "boolean":
      return true;
    case "number":
      return attrType.min || 0;
    case "enum":
      return attrType.values[0];
    case "string":
      return "";
    default:
      return "";
  }
}

/**
 * Get the appropriate input type for an attribute
 */
export function getInputTypeForAttribute(
  attribute: AttributeKey
): "checkbox" | "select" | "number" | "text" {
  const attrType = ATTRIBUTE_DEFINITIONS[attribute];
  if (!attrType) return "text";

  switch (attrType.kind) {
    case "boolean":
      return "checkbox";
    case "enum":
      return "select";
    case "number":
      return "number";
    case "string":
      return "text";
    default:
      return "text";
  }
}

/**
 * Get color class for metric values (for UI styling)
 */
export function getMetricColor(value: number): string {
  if (value > 100) return "text-purple-600";
  if (value > 50) return "text-green-600";
  if (value > 20) return "text-blue-600";
  if (value > 0) return "text-gray-800";
  return "text-red-600";
}

/**
 * Format metric value for display
 */
export function formatMetricValue(value: number): string {
  return typeof value === "number"
    ? String(Math.round(value * 100) / 100)
    : String(value);
}
