import { describe, it, expect } from "vitest";
import { defineConfig, createEngine } from "../src/index.js";

const config = defineConfig({
  metrics: ["Health", "Strength"] as const,
  operations: ["sum", "multiply"] as const,
  attributes: [
    { key: "Level", kind: "number", min: 1, max: 100 },
    { key: "Active", kind: "boolean" },
  ] as const,
});

const engine = createEngine(config);

describe("Builder Advanced Features", () => {
  it("supports group context with when and with metadata", () => {
    const item = engine
      .builder()
      .set("Level", 10)
      .set("Active", true)
      .increase("Health")
      .by(10)
      .group(
        {
          when: { op: "eq", attr: "Active", value: true },
          with: { priority: 5, source: "active-bonus" },
        },
        (b) => {
          b.increase("Health").by(20);
          b.increase("Strength").by(15);
        }
      )
      .increase("Health")
      .by(5) // Normal modifier after group
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Health).toBe(35); // 10 + 20 + 5
    expect(result.metrics.Strength).toBe(15);

    // Check that group modifiers have the correct metadata
    const groupModifiers = result.applied.filter(
      (m) => m.modifier.source === "active-bonus"
    );
    expect(groupModifiers).toHaveLength(2);
    expect(groupModifiers.every((m) => m.modifier.priority === 5)).toBe(true);
  });

  it("clears conditions and metadata appropriately", () => {
    const builder = engine
      .builder()
      .when({ op: "eq", attr: "Active", value: true })
      .with({ priority: 10, source: "test" });

    // Add a modifier with condition/metadata
    builder.increase("Health").by(5);

    // Clear conditions but keep metadata
    builder.clearConditions().increase("Health").by(10);

    // Clear metadata too
    builder.clearMeta().increase("Health").by(15);

    const item = builder.build();

    // First modifier should have condition/metadata
    expect(item.modifiers[0].conditions).toBeDefined();
    expect(item.modifiers[0].priority).toBe(10);

    // Second modifier should have no condition (cleared), no metadata (context reset after first modifier)
    expect(item.modifiers[1].conditions).toBeUndefined();
    expect(item.modifiers[1].priority).toBeUndefined();

    // Third modifier should have neither
    expect(item.modifiers[2].conditions).toBeUndefined();
    expect(item.modifiers[2].priority).toBeUndefined();
  });

  it("resets builder state completely", () => {
    const builder = engine
      .builder()
      .set("Level", 5)
      .increase("Health")
      .by(10)
      .when({ op: "eq", attr: "Active", value: true });

    expect(builder.attributeCount).toBe(1);
    expect(builder.modifierCount).toBe(1);

    builder.reset();

    expect(builder.attributeCount).toBe(0);
    expect(builder.modifierCount).toBe(0);

    const item = builder.build();
    expect(Object.keys(item.attributes)).toHaveLength(0);
    expect(item.modifiers).toHaveLength(0);
  });

  it("clears only modifiers or only attributes", () => {
    const builder = engine.builder().set("Level", 5).increase("Health").by(10);

    builder.clearModifiers();
    expect(builder.modifierCount).toBe(0);
    expect(builder.attributeCount).toBe(1);

    builder.clearAttributes();
    expect(builder.attributeCount).toBe(0);
  });

  it("handles nested groups correctly", () => {
    const item = engine
      .builder()
      .set("Active", true)
      .group({ when: { op: "eq", attr: "Active", value: true } }, (b) => {
        b.increase("Health").by(10);
        b.group({ with: { source: "nested" } }, (nested) => {
          nested.increase("Strength").by(5);
        });
      })
      .build();

    const result = engine.evaluate(item);
    expect(result.metrics.Health).toBe(10);
    expect(result.metrics.Strength).toBe(5);

    // Nested modifier should have both the condition and nested source
    const nestedModifier = result.applied.find(
      (m) => m.modifier.source === "nested"
    );
    expect(nestedModifier?.modifier.conditions).toBeDefined();
  });
});
