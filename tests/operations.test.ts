import { describe, it, expect } from "vitest";
import {
  sumOperation,
  subtractOperation,
  multiplyOperation,
  createBuiltInOperations,
  validateNumericResult,
} from "../src/index.js";

describe("Operations", () => {
  describe("Built-in Operations", () => {
    it("sum operation adds values correctly", () => {
      const sum = sumOperation();
      expect(sum(10, 5, {} as any)).toBe(15);
      expect(sum(0, 10, {} as any)).toBe(10);
      expect(sum(-5, 3, {} as any)).toBe(-2);
    });

    it("subtract operation subtracts values correctly", () => {
      const subtract = subtractOperation();
      expect(subtract(10, 5, {} as any)).toBe(5);
      expect(subtract(0, 10, {} as any)).toBe(-10);
      expect(subtract(-5, 3, {} as any)).toBe(-8);
    });

    it("multiply operation multiplies values correctly", () => {
      const multiply = multiplyOperation();
      expect(multiply(10, 2, {} as any)).toBe(20);
      expect(multiply(5, 0, {} as any)).toBe(0);
      expect(multiply(-3, 4, {} as any)).toBe(-12);
    });
  });

  describe("Operation Registry", () => {
    it("creates built-in operations with correct precedence", () => {
      const operations = createBuiltInOperations();

      expect(operations.has("sum")).toBe(true);
      expect(operations.has("subtract")).toBe(true);
      expect(operations.has("multiply")).toBe(true);

      // Verify precedence order
      const sumPrec = operations.get("sum")?.precedence;
      const multiplyPrec = operations.get("multiply")?.precedence;

      expect(multiplyPrec).toBeGreaterThan(sumPrec!);
    });
  });

  describe("Numeric Validation", () => {
    it("validates finite numbers", () => {
      expect(validateNumericResult(42, "test")).toBe(42);
      expect(validateNumericResult(0, "test")).toBe(0);
      expect(validateNumericResult(-10.5, "test")).toBe(-10.5);
    });

    it("throws for invalid numbers", () => {
      expect(() => validateNumericResult(NaN, "test")).toThrow();
      expect(() => validateNumericResult(Infinity, "test")).toThrow();
      expect(() => validateNumericResult(-Infinity, "test")).toThrow();
    });
  });
});
