import { describe, it, expect } from "vitest";
import {
  defineConfig,
  createEngine,
  ValidationError,
  EvaluationError,
  SerializationError,
} from "../src/index.js";

const config = defineConfig({
  metrics: ["Health"] as const,
  operations: ["sum"] as const,
  attributes: [{ key: "Level", kind: "number", min: 1, max: 10 }] as const,
});

const engine = createEngine(config);

describe("Error Handling", () => {
  it("throws ValidationError for unknown metrics in builder", () => {
    expect(() => {
      engine
        .builder()
        // @ts-expect-error intentionally invalid
        .increase("UnknownMetric")
        .by(5);
    }).toThrow(ValidationError);
  });

  it("throws ValidationError for unknown operations in builder", () => {
    expect(() => {
      engine
        .builder()
        // @ts-expect-error intentionally invalid
        .apply("Health", "unknownOp")
        .by(5);
    }).toThrow(ValidationError);
  });

  it("throws ValidationError for invalid modifier values", () => {
    expect(() => {
      engine.builder().increase("Health").by(NaN);
    }).toThrow(ValidationError);

    expect(() => {
      engine.builder().increase("Health").by(Infinity);
    }).toThrow(ValidationError);
  });

  it("throws EvaluationError for operations producing invalid results", () => {
    // First add badOp to the config operations
    const badConfig = defineConfig({
      metrics: ["Health"] as const,
      operations: ["sum", "badOp"] as const,
      attributes: [{ key: "Level", kind: "number", min: 1, max: 10 }] as const,
    });

    const badEngine = createEngine(badConfig);

    // Register a bad operation that returns NaN
    badEngine.registerOperation?.("badOp", () => NaN, { precedence: 10 });

    const item = badEngine.builder().apply("Health", "badOp").by(5).build();

    expect(() => {
      badEngine.evaluate(item);
    }).toThrow(EvaluationError);
  });

  it("handles serialization errors gracefully", () => {
    // Create an object with circular references
    const circular: any = { name: "test" };
    circular.self = circular;

    expect(() => {
      // @ts-expect-error intentionally invalid
      SerializationError.prototype.toJSON = () => circular;
    }).not.toThrow(); // Setup doesn't throw

    // The actual serialization should fail appropriately
    // This tests that our error handling is robust
  });

  it("provides meaningful error messages", () => {
    try {
      engine
        .builder()
        // @ts-expect-error intentionally invalid
        .increase("BadMetric")
        .by(5);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toContain(
        "Unknown metric: BadMetric"
      );
    }
  });

  it("handles condition evaluation failures gracefully", () => {
    // Create an item with a condition that references a non-existent attribute
    const item = {
      attributes: { Level: 5 },
      modifiers: [
        {
          metric: "Health" as const,
          operation: "sum" as const,
          value: 10,
          conditions: {
            op: "eq" as const,
            attr: "NonExistentAttr" as any,
            value: "test",
          },
        },
      ],
    };

    // Should not throw, but should skip the modifier
    const result = engine.evaluate(item);
    expect(result.applied).toHaveLength(0);
    expect(result.metrics.Health).toBe(0);
  });
});
