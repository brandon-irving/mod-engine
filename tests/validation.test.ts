import { describe, it, expect } from "vitest";
import { defineConfig, createEngine } from "../src/index.js";

const config = defineConfig({
  metrics: ["Power"] as const,
  operations: ["sum"] as const,
  attributes: [
    { key: "Level", kind: "number", min: 1, max: 10, integer: true } as const,
  ],
});

const engine = createEngine(config);

describe("Validation", () => {
  it("returns ok: true for a valid item", () => {
    const validItem = engine
      .builder()
      .set("Level", 5)
      .increase("Power")
      .by(10)
      .build();

    const result = engine.validateItem(validItem);
    expect(result.ok).toBe(true);
  });

  it("reports unknown attribute and invalid modifier", () => {
    // @ts-expect-error intentionally invalid attribute
    const invalidItem: any = {
      attributes: { Unknown: "bad" },
      modifiers: [
        {
          metric: "UnknownMetric",
          operation: "sum",
          value: 5,
        },
      ],
    };

    const result = engine.validateItem(invalidItem);
    expect(result.ok).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
    // Should include an error about unknown attribute key
    expect(result.errors?.some((e) => e.code === "UNKNOWN_ATTRIBUTE")).toBe(
      true
    );
  });
});
