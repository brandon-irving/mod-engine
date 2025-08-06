/**
 * RPG SDK - Main Entry Point
 * A comprehensive SDK for the RPG mod engine with easy-to-use APIs
 */

// Core exports
import { rpgEngine, rpgConfig } from "./config";
export { rpgEngine, rpgConfig };
export type { RpgConfig } from "./config";

// Types
import type { RpgSdkContext, ItemState, ModifierForm } from "./types";
export type {
  Metric,
  Operation,
  ConditionOperation,
  AttributeKey,
  ItemState,
  ModifierForm,
  DemoItem,
  RpgSdkContext,
} from "./types";

// Re-export mod-engine types for consistency
export type { ModifierApplication } from "mod-engine";

// Constants
import {
  ATTRIBUTE_DEFINITIONS,
  DEFAULT_BASE_METRICS,
  METRICS,
  OPERATIONS,
  CONDITION_OPERATIONS,
  METRIC_ICONS,
  DEFAULT_ITEM_STATE,
} from "./constants";
export {
  ATTRIBUTE_DEFINITIONS,
  DEFAULT_BASE_METRICS,
  METRICS,
  OPERATIONS,
  CONDITION_OPERATIONS,
  METRIC_ICONS,
  DEFAULT_ITEM_STATE,
};

// Helpers
import {
  createModifier,
  evaluateItem,
  buildItem,
  validateModifier,
  getDefaultValueForAttribute,
  getInputTypeForAttribute,
  getMetricColor,
  formatMetricValue,
} from "./helpers";
export {
  createModifier,
  evaluateItem,
  buildItem,
  validateModifier,
  getDefaultValueForAttribute,
  getInputTypeForAttribute,
  getMetricColor,
  formatMetricValue,
};

// Re-export useful mod-engine types
export type { ItemSpec, EvaluationResult } from "mod-engine";

/**
 * Create a complete SDK context with all utilities
 * This is the main API for consumers who want everything in one place
 */
export function createRpgSdk(): RpgSdkContext {
  return {
    engine: rpgEngine,
    config: rpgConfig,
    constants: {
      metrics: METRICS,
      operations: OPERATIONS,
      conditionOperations: CONDITION_OPERATIONS,
      defaultBaseMetrics: DEFAULT_BASE_METRICS,
      metricIcons: METRIC_ICONS,
      attributeDefinitions: ATTRIBUTE_DEFINITIONS,
    },
    helpers: {
      createModifier,
      evaluateItem,
      buildItem,
      validateModifier,
      getDefaultValueForAttribute,
    },
  };
}

/**
 * Quick start function - builds and evaluates an item in one call
 */
export function quickEvaluate(
  itemState: ItemState,
  modifiers: ModifierForm[] = []
) {
  const item = buildItem(itemState, modifiers);
  return evaluateItem(item);
}

// Default export for convenience
export default {
  createRpgSdk,
  quickEvaluate,
  engine: rpgEngine,
  config: rpgConfig,
  constants: {
    METRICS,
    OPERATIONS,
    CONDITION_OPERATIONS,
    DEFAULT_BASE_METRICS,
    METRIC_ICONS,
    ATTRIBUTE_DEFINITIONS,
    DEFAULT_ITEM_STATE,
  },
  helpers: {
    createModifier,
    evaluateItem,
    buildItem,
    validateModifier,
    getDefaultValueForAttribute,
    getInputTypeForAttribute,
    getMetricColor,
    formatMetricValue,
  },
};
