/**
 * RPG SDK Constants
 * Centralized definitions for all RPG game constants
 */

// Attribute type definitions for smart UI components and validation
export type AttributeType =
  | { kind: "enum"; values: string[] }
  | { kind: "number"; min: number; max: number }
  | { kind: "boolean" }
  | { kind: "string"; minLen?: number; maxLen?: number };

export const ATTRIBUTE_DEFINITIONS: Record<string, AttributeType> = {
  Rarity: { kind: "enum", values: ["Common", "Rare", "Epic", "Legendary"] },
  Tags: {
    kind: "enum",
    values: [
      "Weapon",
      "Armor",
      "Consumable",
      "Accessory",
      "Ring",
      "Amulet",
      "Potion",
    ],
  },
  Level: { kind: "number", min: 1, max: 100 },
  Enchanted: { kind: "boolean" },
  ItemName: { kind: "string", minLen: 1, maxLen: 50 },
  Quality: { kind: "number", min: 0, max: 100 },
  Cursed: { kind: "boolean" },
  SocketCount: { kind: "number", min: 0, max: 10 },
};

// Default base metrics for all items
export const DEFAULT_BASE_METRICS = {
  Health: 10,
  Strength: 10,
  Speed: 10,
  Mana: 10,
  Damage: 10,
  Defense: 10,
} as const;

// Available metrics
export const METRICS = [
  "Health",
  "Strength",
  "Speed",
  "Mana",
  "Damage",
  "Defense",
] as const;

// Available operations
export const OPERATIONS = ["sum", "subtract", "multiply"] as const;

// Available condition operations
export const CONDITION_OPERATIONS = [
  "eq",
  "gt",
  "gte",
  "lt",
  "lte",
  "includes",
] as const;

// Metric icons for UI display
export const METRIC_ICONS = {
  Health: "❤️",
  Strength: "💪",
  Speed: "⚡",
  Mana: "🔮",
  Damage: "⚔️",
  Defense: "🛡️",
} as const;

// Default item state for new items
export const DEFAULT_ITEM_STATE = {
  itemName: "New Item",
  rarity: "Common" as const,
  tags: [] as string[],
  level: 1,
  enchanted: false,
  quality: 50,
  cursed: false,
  socketCount: 0,
};
