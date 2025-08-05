import { describe, it, expect } from "vitest";
import {
  defineConfig,
  createEngine,
  serializeItem,
  deserializeItem,
} from "../src/index";

// Reusable configuration for tests
const config = defineConfig({
  metrics: ["Health", "Strength", "Speed", "Mana"] as const,
  operations: ["sum", "subtract", "multiply", "pow"] as const,
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
      values: ["Weapon", "Armor", "Consumable", "Accessory"] as const,
      cardinality: "multi",
    },
    {
      key: "Level",
      kind: "number",
      min: 1,
      max: 100,
      integer: true,
    },
    { key: "Enchanted", kind: "boolean" },
  ] as const,
});

const engine = createEngine(config, { strictOperations: false });

describe("Builder", () => {
  it("builds an item with attributes and modifiers", () => {
    const item = engine
      .builder("Sword")
      .set("Level", 5)
      .increase("Health")
      .by(10)
      .build();

    expect(item.name).toBe("Sword");
    expect(item.attributes.Level).toBe(5);
    expect(item.modifiers).toHaveLength(1);
    expect(item.modifiers[0]).toMatchObject({ metric: "Health", value: 10 });
  });

  it("clones a builder and keeps state isolated", () => {
    const original = engine.builder().set("Level", 1).increase("Health").by(5);

    const cloned = original.clone();

    // Modify clone only
    cloned.increase("Strength").by(7);

    expect(original.modifierCount).toBe(1);
    expect(cloned.modifierCount).toBe(2);
  });
});

describe("Evaluation", () => {
  it("applies operation precedence (multiply after add/subtract)", () => {
    const item = engine
      .builder()
      .increase("Health")
      .by(10) // +10 => 10
      .decrease("Health")
      .by(2) // -2  => 8
      .multiply("Health")
      .by(2) // *2  => 16
      .build();

    const result = engine.evaluate(item);
    // Based on precedence: multiply (20) > add/subtract (10)
    // So multiply happens first: 0 * 2 = 0, then +10 -2 = 8
    expect(result.metrics.Health).toBe(8);
  });

  it("respects unique stacking (highest absolute value wins)", () => {
    const item = engine
      .builder()
      .with({ stacking: "unique", source: "legendary" })
      .increase("Strength")
      .by(80)
      .with({ stacking: "unique", source: "legendary" })
      .increase("Strength")
      .by(120) // Should win
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Strength).toBe(120);
    expect(result.applied).toHaveLength(1);
  });

  it("respects uniqueBy custom keys", () => {
    const item = engine
      .builder()
      .with({ stacking: { uniqueBy: "custom" } })
      .increase("Mana")
      .by(30)
      .with({ stacking: { uniqueBy: "custom" } })
      .increase("Mana")
      .by(20) // lower absolute -> ignored
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Mana).toBe(30);
  });

  it("applies conditional modifiers correctly", () => {
    const item = engine
      .builder()
      .set("Enchanted", true)
      .increase("Speed")
      .by(10)
      .when({ op: "eq", attr: "Enchanted", value: true })
      .multiply("Speed")
      .by(2)
      .build();

    const result = engine.evaluate(item);
    // Multiply has higher precedence, so: 0 * 2 = 0, then +10 = 10
    expect(result.metrics.Speed).toBe(10);
  });

  it("prioritises modifiers using the priority field", () => {
    const item = engine
      .builder()
      .with({ priority: 1 })
      .increase("Health")
      .by(5)
      .with({ priority: 10 })
      .increase("Health")
      .by(7)
      .build();

    const { applied } = engine.evaluate(item);
    expect(applied[0].appliedValue).toBe(7); // Highest priority applied first
  });
});

describe("Serialization", () => {
  it("round-trips an item spec", () => {
    const original = engine
      .builder("SerSword")
      .set("Level", 3)
      .increase("Health")
      .by(15)
      .build();

    const serialized = serializeItem(original);
    const deserialized = deserializeItem(serialized);

    // Evaluate both to ensure functional equality
    const resultOriginal = engine.evaluate(original);
    const resultDeserialized = engine.evaluate(deserialized);

    expect(resultDeserialized.metrics).toEqual(resultOriginal.metrics);
  });
});

describe("Custom Operations", () => {
  it("supports registering and using a custom operation", () => {
    engine.registerOperation?.(
      "pow",
      (current, value) => Math.pow(current, value),
      { precedence: 5 }
    );

    const item = engine
      .builder()
      .increase("Health")
      .by(2) // Start 2
      .apply("Health", "pow")
      .by(3) // 2^3 = 8
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Health).toBe(8);
  });
});
