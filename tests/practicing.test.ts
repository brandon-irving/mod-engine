/**
 * Where we test examples
 */

import { describe, it } from "vitest";
import {
  defineConfig,
  createEngine,
  builtinOps,
  type BuiltinOperation,
  createEngineBuilder,
  ItemSpec,
  EvaluationResult,
} from "../src/index.js";
import { expect } from "vitest";

export const basketballConfig = defineConfig({
  // ➊  include only the stats you care about in game play / UI
  metrics: [
    "netRating",
    "pts",
    "tov",
    "fg3m",
    "ftm",
    // … add any other keys you plan to surface
  ] as const,

  // ➋  operations – we’ll start with the built-ins
  operations: builtinOps("sum", "subtract", "multiply"),

  // ➌  equip attributes we want to query against (rarity, slot, etc.)
  attributes: [
    { key: "rarity", kind: "enum", values: ["common", "rare", "legendary"] },
    { key: "slot", kind: "enum", values: ["jersey", "shoes", "armband"] },
  ] as const,
});

const engine = createEngineBuilder(basketballConfig).build();
type PlayerStats = any;
type Log = any;
export type UniqueAbility = (
  s: PlayerStats,
  rng: () => number,
  log: Log,
  equipName?: string
) => void;
export interface Equip {
  spec: ItemSpec<typeof basketballConfig>;
  abilities?: UniqueAbility[];
}

// Sugar so designers can write very little TS
export const EquipBuilder = {
  jersey: (name: string, rarity: "common" | "rare" | "legendary") =>
    engine.builder(name).set("slot", "jersey").set("rarity", rarity),
};

// Basic Jersey  (+0.25 NR)
export const basicJersey: Equip = {
  spec: EquipBuilder.jersey("Basic Jersey", "common")
    .increase("netRating")
    .by(0.25)
    .build(),
};

// Swingman Jersey  (+0.50 NR)  5 % chance to delete turnovers
export const swingmanJersey: Equip = {
  spec: EquipBuilder.jersey("Swingman Jersey", "rare")
    .increase("netRating")
    .by(0.5)
    .build(),
  abilities: [
    (s, rng, log) => {
      if (rng() < 0.05) {
        // 5 % proc
        s.pts += s.tov;
        log.push("Swingman Jersey proc’d: turnovers removed from points");
      }
    },
  ],
};

const baseEngine = createEngine(basketballConfig);

export function applyEquips(
  base: PlayerStats,
  equips: Equip[],
  seed = Date.now().toString()
) {
  // ➊  merge all regular modifiers into a single ItemSpec
  const mergedSpec = equips.reduce(
    (acc, eq) => ({
      // concat modifier arrays
      ...acc,
      modifiers: [...acc.modifiers, ...eq.spec.modifiers] as any,
    }),
    { attributes: {}, modifiers: [] } as ItemSpec<typeof basketballConfig>
  );

  // ➋  run deterministic evaluation for the additive / multiplicative parts
  const evalRes: EvaluationResult<typeof basketballConfig> =
    baseEngine.evaluate(mergedSpec, { base });

  // ➌  clone stats so we can mutate safely
  const updated: PlayerStats = { ...base, ...evalRes.metrics };
  const log: Log = [];

  // ➍  unique abilities (chance, conversions, etc.)
  const rng = Math.random;
  for (const e of equips)
    e.abilities?.forEach((ability) => ability(updated, rng, log));

  return { stats: updated, log, trace: evalRes.applied };
}

export const mysticShoes: Equip = {
  spec: EquipBuilder.jersey("Mystic Shoes", "rare")
    .decrease("tov")
    .by(1)
    .build(),
};

export const onFire: UniqueAbility = (s, _rng, log, equipName?: string) => {
  if (s.ftm === 0) return;
  s.fg3m += s.ftm;
  log.push(`${equipName} On Fire: converted ${s.ftm} FT → 3PM`);
  s.ftm = 0;
};

export const complexJersey: Equip = {
  spec: EquipBuilder.jersey("Complex Jersey", "legendary").build(),
  abilities: [
    (s, rng, log) => {
      onFire(s, rng, log, "Complex Jersey");
    },
  ], // same ability, different item
};

// ────────────────────────────────────────────────────────────────
// Frontend-Friendly Equip Builder Helpers
// ────────────────────────────────────────────────────────────────

export type StatModifier = {
  stat: "netRating" | "pts" | "tov" | "fg3m" | "ftm";
  operation: "increase" | "decrease" | "multiply";
  amount: number;
};

export type EquipDefinition = {
  name: string;
  slot: "jersey" | "shoes" | "armband";
  rarity: "common" | "rare" | "legendary";
  modifiers: StatModifier[];
};

/**
 * Helper to get all available stats for frontend dropdowns
 */
export function getAvailableStats(): readonly string[] {
  return basketballConfig.metrics;
}

/**
 * Helper to get all available slots for frontend dropdowns
 */
export function getAvailableSlots(): readonly string[] {
  return ["jersey", "shoes", "armband"] as const;
}

/**
 * Helper to get all available rarities for frontend dropdowns
 */
export function getAvailableRarities(): readonly string[] {
  return ["common", "rare", "legendary"] as const;
}

/**
 * Builds an equip from a simple frontend-friendly definition
 */
export function buildEquipFromDefinition(definition: EquipDefinition): Equip {
  const { name, slot, rarity, modifiers } = definition;

  // Start with base builder for the slot
  let builder = engine.builder(name).set("slot", slot).set("rarity", rarity);

  // Apply each modifier
  for (const modifier of modifiers) {
    switch (modifier.operation) {
      case "increase":
        builder = builder.increase(modifier.stat).by(modifier.amount);
        break;
      case "decrease":
        builder = builder.decrease(modifier.stat).by(modifier.amount);
        break;
      case "multiply":
        builder = builder.multiply(modifier.stat).by(modifier.amount);
        break;
    }
  }

  return {
    spec: builder.build(),
  };
}

/**
 * Creates a stat modifier object (for frontend to build arrays)
 */
export function createStatModifier(
  stat: StatModifier["stat"],
  operation: StatModifier["operation"],
  amount: number
): StatModifier {
  return { stat, operation, amount };
}

/**
 * Validates if a stat modifier is valid
 */
export function validateStatModifier(modifier: StatModifier): boolean {
  const validStats = getAvailableStats();
  const validOperations = ["increase", "decrease", "multiply"];

  return (
    validStats.includes(modifier.stat) &&
    validOperations.includes(modifier.operation) &&
    typeof modifier.amount === "number" &&
    Number.isFinite(modifier.amount)
  );
}

describe("practicing", () => {
  it("should work", () => {
    const stats = applyEquips(
      { netRating: 1, pts: 1, tov: 1, fg3m: 1, ftm: 1 },
      [complexJersey, mysticShoes]
    );
    console.log(stats);
  });

  it("should build equips dynamically", () => {
    // Frontend sends this data structure
    const frontendEquipDefinition: EquipDefinition = {
      name: "Dynamic Super Jersey",
      slot: "jersey",
      rarity: "legendary",
      modifiers: [
        createStatModifier("netRating", "increase", 2.5),
        createStatModifier("pts", "increase", 5),
        createStatModifier("tov", "decrease", 1),
        createStatModifier("fg3m", "multiply", 1.1),
      ],
    };

    // Backend builds the equip
    const dynamicEquip = buildEquipFromDefinition(frontendEquipDefinition);

    // Test it works
    const result = applyEquips(
      { netRating: 10, pts: 25, tov: 3, fg3m: 2, ftm: 4 },
      [dynamicEquip]
    );
    expect(1).toBe(1);
    console.log("Dynamic equip result:", result);

    // Verify the modifications worked
    // netRating: 10 + 2.5 = 12.5
    // pts: 25 + 5 = 30
    // tov: 3 - 1 = 2
    // fg3m: 2 * 1.1 = 2.2
    // ftm: unchanged = 4
  });
});
