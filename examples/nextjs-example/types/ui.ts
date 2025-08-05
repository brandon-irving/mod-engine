/**
 * UI-specific types that are not part of the core RPG SDK
 * These are only used for component-specific logic
 */

// Re-export commonly used SDK types for convenience
export type {
  ItemState as ItemBuilderState,
  ModifierForm,
  DemoItem,
  RpgConfig,
  Metric,
  Operation,
  ConditionOperation,
} from "@/lib/rpg-sdk";

// UI-specific enums and constants
export enum Tags {
  Weapon = "Weapon",
  Armor = "Armor",
  Consumable = "Consumable",
  Accessory = "Accessory",
  Ring = "Ring",
  Amulet = "Amulet",
  Potion = "Potion",
}
