/**
 * RPG SDK Types
 * Centralized type definitions for the RPG mod engine SDK
 */

import type { ItemSpec, EvaluationResult, Engine, AttrKeyOf } from "mod-engine";
import type { METRICS, OPERATIONS, CONDITION_OPERATIONS } from "./constants";
import type { RpgConfig } from "./config";

// Core SDK types
export type Metric = (typeof METRICS)[number];
export type Operation = (typeof OPERATIONS)[number];
export type ConditionOperation = (typeof CONDITION_OPERATIONS)[number];
export type AttributeKey = AttrKeyOf<RpgConfig>;

// Item state for UI
export interface ItemState {
  itemName: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  tags: (
    | "Weapon"
    | "Armor"
    | "Consumable"
    | "Accessory"
    | "Ring"
    | "Amulet"
    | "Potion"
  )[];
  level: number;
  enchanted: boolean;
  quality: number;
  cursed: boolean;
  socketCount: number;
}

// Modifier form for UI
export interface ModifierForm {
  id: string;
  metric: Metric;
  operation: Operation;
  value: number;
  priority: number;
  hasCondition: boolean;
  condition?: {
    attribute: AttributeKey;
    operation: ConditionOperation;
    value: any;
  };
  stacking: "default" | "unique";
  source?: string;
}

// RpgConfig is imported from config.ts (actual engine type)

// Demo item for examples
export interface DemoItem {
  name: string;
  description: string;
  item: ItemSpec<RpgConfig>;
  expectedMetrics: Record<string, number>;
}

// SDK context for easy access to everything
export interface RpgSdkContext {
  engine: Engine<RpgConfig>;
  config: RpgConfig;
  constants: {
    metrics: typeof METRICS;
    operations: typeof OPERATIONS;
    conditionOperations: typeof CONDITION_OPERATIONS;
    defaultBaseMetrics: typeof import("./constants").DEFAULT_BASE_METRICS;
    metricIcons: typeof import("./constants").METRIC_ICONS;
    attributeDefinitions: typeof import("./constants").ATTRIBUTE_DEFINITIONS;
  };
  helpers: {
    createModifier: (partial?: Partial<ModifierForm>) => ModifierForm;
    evaluateItem: (item: ItemSpec<RpgConfig>) => EvaluationResult<RpgConfig>;
    buildItem: (
      itemState: ItemState,
      modifiers: ModifierForm[]
    ) => ItemSpec<RpgConfig>;
    validateModifier: (modifier: ModifierForm) => string[];
    getDefaultValueForAttribute: (
      attribute: AttributeKey
    ) => string | number | boolean | string[];
  };
}
