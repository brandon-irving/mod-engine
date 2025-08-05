/**
 * RPG SDK Configuration
 * Engine setup and configuration for the RPG mod system
 */

import { defineConfig, createEngine } from "mod-engine";

// Define our RPG configuration with comprehensive attributes and metrics
export const rpgConfig = defineConfig({
  metrics: [
    "Health",
    "Strength",
    "Speed",
    "Mana",
    "Damage",
    "Defense",
  ] as const,
  operations: ["sum", "subtract", "multiply"] as const,
  attributes: [
    {
      key: "Rarity",
      kind: "enum",
      values: ["Common", "Rare", "Epic", "Legendary"] as const,
      cardinality: "single",
    },
    {
      key: "Tags",
      kind: "enum",
      values: [
        "Weapon",
        "Armor",
        "Consumable",
        "Accessory",
        "Ring",
        "Amulet",
        "Potion",
      ] as const,
      cardinality: "multi",
    },
    {
      key: "Level",
      kind: "number",
      min: 1,
      max: 100,
      integer: true,
    },
    {
      key: "Enchanted",
      kind: "boolean",
    },
    {
      key: "ItemName",
      kind: "string",
      minLen: 1,
      maxLen: 50,
    },
    {
      key: "Quality",
      kind: "number",
      min: 0,
      max: 100,
      integer: true,
    },
    {
      key: "Cursed",
      kind: "boolean",
    },
    {
      key: "SocketCount",
      kind: "number",
      min: 0,
      max: 10,
      integer: true,
    },
  ] as const,
});

// Create the engine instance
export const rpgEngine = createEngine(rpgConfig);

// Export the actual config type (inferred from defineConfig)
export type RpgConfig = typeof rpgConfig;
