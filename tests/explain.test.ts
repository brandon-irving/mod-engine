import { describe, it, expect } from "vitest";
import { defineConfig, createEngine, explainEvaluation } from "../src/index";

// Shared test config
const config = defineConfig({
  metrics: ["Health", "Strength", "Speed", "Mana"] as const,
  operations: ["sum", "subtract", "multiply"] as const,
  attributes: [
    { key: "Enchanted", kind: "boolean" },
    { key: "Level", kind: "number", min: 1, max: 100, integer: true },
  ] as const,
});

const engine = createEngine(config, { strictOperations: false });

describe("explainEvaluation", () => {
  it("maps a single applied modifier to an AppliedTrace entry", () => {
    const item = engine.builder().increase("Health").by(10).build();

    const result = engine.evaluate(item);
    const trace = explainEvaluation(result);

    expect(trace).toHaveLength(1);
    expect(trace[0]).toMatchObject({
      metric: "Health",
      operation: "sum",
      value: 10,
      conditionMatched: true,
    });

    // Ensure before/after are forwarded from evaluation result
    expect(typeof trace[0].before).toBe("number");
    expect(typeof trace[0].after).toBe("number");
  });

  it("includes metadata such as priority and source from the modifier", () => {
    const item = engine
      .builder()
      .with({ priority: 42, source: "test-source" })
      .multiply("Strength")
      .by(1.5)
      .build();

    const result = engine.evaluate(item);
    const [entry] = explainEvaluation(result);

    expect(entry.priority).toBe(42);
    expect(entry.source).toBe("test-source");
    expect(entry.metric).toBe("Strength");
    expect(entry.operation).toBe("multiply");
  });

  it("returns an empty array when no modifiers were applied", () => {
    const item = engine.builder().build();
    const result = engine.evaluate(item);
    expect(result.applied).toHaveLength(0);
    expect(explainEvaluation(result)).toEqual([]);
  });

  it("maps multiple applied modifiers preserving order", () => {
    const item = engine
      .builder()
      .increase("Mana")
      .by(5)
      .increase("Mana")
      .by(3)
      .build();

    const result = engine.evaluate(item);
    const trace = explainEvaluation(result);

    expect(trace.map((t) => [t.metric, t.operation, t.value])).toEqual([
      ["Mana", "sum", 5],
      ["Mana", "sum", 3],
    ]);
  });
});
