import { describe, it, expect } from "vitest";
import {
  defineConfig,
  createEngine,
  createConditionBuilder,
} from "../src/index";

const config = defineConfig({
  metrics: ["Health", "Mana"] as const,
  operations: ["sum"] as const,
  attributes: [
    {
      key: "Type",
      kind: "enum",
      values: ["Sword", "Shield", "Potion"] as const,
      cardinality: "single",
    },
    {
      key: "Tags",
      kind: "enum",
      values: ["Magic", "Physical", "Rare"] as const,
      cardinality: "multi",
    },
    { key: "Level", kind: "number", min: 1, max: 50 },
    { key: "Active", kind: "boolean" },
  ] as const,
});

const engine = createEngine(config);
const c = createConditionBuilder<typeof config>();

describe("Conditions", () => {
  it("evaluates equality conditions", () => {
    const item = engine
      .builder()
      .set("Type", "Sword")
      .set("Level", 10)
      .increase("Health")
      .by(5)
      .when(c.eq("Type", "Sword"))
      .increase("Health")
      .by(10) // Should apply
      .when(c.eq("Type", "Shield"))
      .increase("Health")
      .by(20) // Should NOT apply
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Health).toBe(15); // 5 + 10
  });

  it("evaluates numeric comparison conditions", () => {
    const item = engine
      .builder()
      .set("Level", 25)
      .increase("Mana")
      .by(10)
      .when(c.gt("Level", 20))
      .increase("Mana")
      .by(5) // Should apply (25 > 20)
      .when(c.lte("Level", 30))
      .increase("Mana")
      .by(3) // Should apply (25 <= 30)
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Mana).toBe(18); // 10 + 5 + 3
  });

  it("evaluates multi-value enum conditions", () => {
    const item = engine
      .builder()
      .set("Tags", ["Magic", "Rare"])
      .increase("Health")
      .by(5)
      .when(c.includes("Tags", "Magic"))
      .increase("Health")
      .by(10) // Should apply
      .when(c.includes("Tags", "Physical"))
      .increase("Health")
      .by(20) // Should NOT apply
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Health).toBe(15);
  });

  it("evaluates logical AND conditions", () => {
    const item = engine
      .builder()
      .set("Type", "Sword")
      .set("Level", 15)
      .increase("Health")
      .by(5)
      .when(c.and(c.eq("Type", "Sword"), c.gt("Level", 10)))
      .increase("Health")
      .by(15) // Should apply (both true)
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Health).toBe(20);
  });

  it("evaluates logical OR conditions", () => {
    const item = engine
      .builder()
      .set("Type", "Potion")
      .set("Level", 5)
      .increase("Health")
      .by(5)
      .when(c.or(c.eq("Type", "Sword"), c.eq("Type", "Potion")))
      .increase("Health")
      .by(10) // Should apply (second condition true)
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Health).toBe(15);
  });

  it("evaluates NOT conditions", () => {
    const item = engine
      .builder()
      .set("Active", false)
      .increase("Health")
      .by(5)
      .when(c.not(c.eq("Active", true)))
      .increase("Health")
      .by(10) // Should apply (NOT true = false, which matches)
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Health).toBe(15);
  });

  it("evaluates IN conditions", () => {
    const item = engine
      .builder()
      .set("Type", "Shield")
      .increase("Health")
      .by(5)
      .when(c.in("Type", ["Sword", "Shield"]))
      .increase("Health")
      .by(15) // Should apply
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Health).toBe(20);
  });
});
