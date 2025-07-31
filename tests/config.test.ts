import { describe, it, expect } from "vitest";
import {
  defineConfig,
  createEngine,
  validateConfig,
  SchemaError,
} from "../src/index.js";

describe("Configuration", () => {
  describe("defineConfig", () => {
    it("creates and validates a proper config", () => {
      const config = defineConfig({
        metrics: ["Health", "Mana"] as const,
        operations: ["sum", "multiply"] as const,
        attributes: [
          { key: "Level", kind: "number", min: 1, max: 100 },
          { key: "Type", kind: "enum", values: ["A", "B"] as const },
        ] as const,
      });

      expect(config.metrics).toEqual(["Health", "Mana"]);
      expect(config.operations).toEqual(["sum", "multiply"]);
      expect(config.attributes).toHaveLength(2);
    });

    it("throws for invalid configs", () => {
      expect(() => {
        defineConfig({
          metrics: [], // Empty metrics
          operations: ["sum"] as const,
          attributes: [] as const,
        });
      }).toThrow(SchemaError);

      expect(() => {
        defineConfig({
          metrics: ["Health"] as const,
          operations: [], // Empty operations
          attributes: [] as const,
        });
      }).toThrow(SchemaError);
    });
  });

  describe("createEngine", () => {
    it("creates a functioning engine from config", () => {
      const config = defineConfig({
        metrics: ["Power"] as const,
        operations: ["sum"] as const,
        attributes: [{ key: "Active", kind: "boolean" }] as const,
      });

      const engine = createEngine(config);

      expect(typeof engine.builder).toBe("function");
      expect(typeof engine.evaluate).toBe("function");
      expect(typeof engine.validateItem).toBe("function");
    });

    it("supports base metrics in evaluation", () => {
      const config = defineConfig({
        metrics: ["Health", "Mana"] as const,
        operations: ["sum"] as const,
        attributes: [] as const,
      });

      const engine = createEngine(config);
      const item = engine.builder().increase("Health").by(10).build();

      const result = engine.evaluate(item, {
        base: { Health: 50, Mana: 20 },
      });

      expect(result.metrics.Health).toBe(60); // 50 + 10
      expect(result.metrics.Mana).toBe(20); // Base value preserved
    });
  });

  describe("validateConfig", () => {
    it("validates attribute schemas correctly", () => {
      expect(() => {
        validateConfig({
          metrics: ["Health"] as const,
          operations: ["sum"] as const,
          attributes: [
            {
              key: "BadEnum",
              kind: "enum",
              values: [], // Empty enum values
            },
          ] as const,
        });
      }).toThrow(SchemaError);

      expect(() => {
        validateConfig({
          metrics: ["Health"] as const,
          operations: ["sum"] as const,
          attributes: [
            {
              key: "BadNumber",
              kind: "number",
              min: 10,
              max: 5, // min > max
            },
          ] as const,
        });
      }).toThrow(SchemaError);
    });

    it("catches duplicate metric and operation names", () => {
      expect(() => {
        validateConfig({
          metrics: ["Health", "Health"] as const, // Duplicate
          operations: ["sum"] as const,
          attributes: [] as const,
        });
      }).toThrow(SchemaError);

      expect(() => {
        validateConfig({
          metrics: ["Health"] as const,
          operations: ["sum", "sum"] as const, // Duplicate
          attributes: [] as const,
        });
      }).toThrow(SchemaError);
    });

    it("catches duplicate attribute keys", () => {
      expect(() => {
        validateConfig({
          metrics: ["Health"] as const,
          operations: ["sum"] as const,
          attributes: [
            { key: "Level", kind: "number" },
            { key: "Level", kind: "boolean" }, // Duplicate key
          ] as const,
        });
      }).toThrow(SchemaError);
    });
  });
});
