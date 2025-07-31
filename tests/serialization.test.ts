import { describe, it, expect } from "vitest";
import {
  defineConfig,
  createEngine,
  serializeItem,
  deserializeItem,
  serializeModifiers,
  deserializeModifiers,
  serializeEvaluationResult,
  deserializeEvaluationResult,
  toJSON,
  fromJSON,
  deepClone,
  SerializationError,
} from "../src/index.js";

const config = defineConfig({
  metrics: ["Health", "Mana"] as const,
  operations: ["sum", "multiply"] as const,
  attributes: [
    { key: "Level", kind: "number", min: 1, max: 50 },
    { key: "Active", kind: "boolean" },
  ] as const,
});

const engine = createEngine(config);

describe("Serialization", () => {
  describe("Item Serialization", () => {
    it("serializes and deserializes items with all features", () => {
      const original = engine
        .builder("Complex Item")
        .set("Level", 25)
        .set("Active", true)
        .increase("Health")
        .by(50)
        .when({ op: "eq", attr: "Active", value: true })
        .with({ priority: 10, source: "bonus", stacking: "unique" })
        .multiply("Health")
        .by(1.5)
        .build();

      const serialized = serializeItem(original);
      expect(serialized.version).toBe(1);
      expect(serialized.data.name).toBe("Complex Item");

      const deserialized = deserializeItem(serialized);
      expect(deserialized.name).toBe(original.name);
      expect(deserialized.attributes).toEqual(original.attributes);
      expect(deserialized.modifiers).toEqual(original.modifiers);
    });

    it("handles items without names", () => {
      const original = engine
        .builder()
        .set("Level", 10)
        .increase("Mana")
        .by(20)
        .build();

      const serialized = serializeItem(original);
      const deserialized = deserializeItem(serialized);

      expect(deserialized.name).toBeUndefined();
      expect(deserialized.attributes).toEqual(original.attributes);
    });
  });

  describe("Modifier Serialization", () => {
    it("serializes and deserializes modifier arrays", () => {
      const modifiers = [
        {
          metric: "Health" as const,
          operation: "sum" as const,
          value: 10,
          priority: 5,
        },
        {
          metric: "Mana" as const,
          operation: "multiply" as const,
          value: 2,
          conditions: { op: "eq" as const, attr: "Active", value: true },
        },
      ];

      const serialized = serializeModifiers(modifiers);
      const deserialized = deserializeModifiers(serialized);

      expect(deserialized).toEqual(modifiers);
    });
  });

  describe("Evaluation Result Serialization", () => {
    it("serializes and deserializes evaluation results", () => {
      const item = engine
        .builder()
        .increase("Health")
        .by(30)
        .multiply("Mana")
        .by(2)
        .build();

      const result = engine.evaluate(item);
      const serialized = serializeEvaluationResult(result);
      const deserialized = deserializeEvaluationResult(serialized);

      expect(deserialized.metrics).toEqual(result.metrics);
      expect(deserialized.applied).toEqual(result.applied);
    });
  });

  describe("JSON Utilities", () => {
    it("converts objects to JSON and back", () => {
      const data = { test: "value", number: 42, bool: true };
      const json = toJSON(data);
      const parsed = fromJSON(json);

      expect(parsed).toEqual(data);
    });

    it("throws SerializationError for invalid JSON", () => {
      expect(() => fromJSON("invalid json")).toThrow(SerializationError);
    });
  });

  describe("Deep Clone", () => {
    it("creates independent copies of objects", () => {
      const original = {
        simple: "value",
        nested: { array: [1, 2, 3], bool: false },
      };

      const cloned = deepClone(original);
      cloned.nested.array.push(4);
      cloned.nested.bool = true;

      expect(original.nested.array).toEqual([1, 2, 3]);
      expect(original.nested.bool).toBe(false);
      expect(cloned.nested.array).toEqual([1, 2, 3, 4]);
      expect(cloned.nested.bool).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("throws meaningful errors for invalid serialized data", () => {
      expect(() => deserializeItem(null as any)).toThrow(SerializationError);
      expect(() => deserializeItem({ version: 999, data: {} } as any)).toThrow(
        SerializationError
      );
      expect(() =>
        deserializeItem({ version: 1, data: { invalid: true } } as any)
      ).toThrow(SerializationError);
    });
  });
});
