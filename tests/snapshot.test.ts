import { describe, expect, it } from "vitest";
import {
  builtinOps,
  createEngine,
  defineConfig,
  toSnapshot,
} from "../src/index";

const config = defineConfig({
  metrics: ["Health", "Strength", "Speed"] as const,
  operations: builtinOps("sum", "multiply"),
  attributes: [
    {
      key: "State",
      kind: "enum",
      values: ["Active", "Inactive"] as const,
    },
    {
      key: "Level",
      kind: "number",
      min: 1,
      max: 100,
      integer: true,
    },
    {
      key: "Enchanted",
      kind: "boolean",
    },
  ] as const,
});

const engine = createEngine(config);

describe("toSnapshot", () => {
  it("creates a flat snapshot with computed metrics and attributes", () => {
    const item = engine
      .builder("TestPlayer")
      .set("State", "Active")
      .set("Level", 25)
      .set("Enchanted", true)
      .increase("Health")
      .by(50)
      .increase("Strength")
      .by(20)
      .multiply("Speed")
      .by(1.5)
      .build();

    const baseStats = { Health: 100, Strength: 15, Speed: 10 };
    const snapshot = toSnapshot(engine, item, baseStats);
    console.log("log: snapshot", JSON.stringify(snapshot, null, 2));
    // Check structure
    expect(snapshot).toHaveProperty("name");
    expect(snapshot).toHaveProperty("metrics");
    expect(snapshot).toHaveProperty("State");
    expect(snapshot).toHaveProperty("Level");
    expect(snapshot).toHaveProperty("Enchanted");

    // Check computed metrics
    expect(snapshot.metrics.Health).toBe(150); // 100 + 50
    expect(snapshot.metrics.Strength).toBe(35); // 15 + 20
    expect(snapshot.metrics.Speed).toBe(15); // 10 * 1.5

    // Check preserved attributes
    expect(snapshot.name).toBe("TestPlayer");
    expect(snapshot.State).toBe("Active");
    expect(snapshot.Level).toBe(25);
    expect(snapshot.Enchanted).toBe(true);
  });

  it("handles missing base stats by defaulting to 0", () => {
    const item = engine
      .builder("SimplePlayer")
      .set("State", "Active")
      .increase("Health")
      .by(25)
      .build();

    const snapshot = toSnapshot(engine, item); // No base stats

    expect(snapshot.metrics.Health).toBe(25); // 0 + 25
    expect(snapshot.metrics.Strength).toBe(0); // Default 0
    expect(snapshot.metrics.Speed).toBe(0); // Default 0
  });

  it("handles missing item name by defaulting to 'Unknown'", () => {
    const item = engine
      .builder() // No name provided
      .set("State", "Inactive")
      .increase("Health")
      .by(10)
      .build();

    const snapshot = toSnapshot(engine, item, { Health: 50 });

    expect(snapshot.name).toBe("Unknown");
    expect(snapshot.metrics.Health).toBe(60); // 50 + 10
    expect(snapshot.State).toBe("Inactive");
  });

  it("provides type-safe access to all properties", () => {
    const item = engine
      .builder("TypedPlayer")
      .set("State", "Active")
      .set("Level", 42)
      .set("Enchanted", false)
      .increase("Strength")
      .by(30)
      .build();

    const snapshot = toSnapshot(engine, item, {
      Health: 75,
      Strength: 10,
      Speed: 12,
    });

    // TypeScript should infer these types correctly
    const name: string = snapshot.name;
    const health: number = snapshot.metrics.Health;
    const strength: number = snapshot.metrics.Strength;
    const speed: number = snapshot.metrics.Speed;
    const state: "Active" | "Inactive" | undefined = snapshot.State;
    const level: number | undefined = snapshot.Level;
    const enchanted: boolean | undefined = snapshot.Enchanted;

    expect(name).toBe("TypedPlayer");
    expect(health).toBe(75);
    expect(strength).toBe(40); // 10 + 30
    expect(speed).toBe(12);
    expect(state).toBe("Active");
    expect(level).toBe(42);
    expect(enchanted).toBe(false);
  });

  it("produces deterministic output for the same inputs", () => {
    const item = engine
      .builder("ConsistentPlayer")
      .set("State", "Active")
      .set("Level", 10)
      .increase("Health")
      .by(20)
      .multiply("Strength")
      .by(2)
      .build();

    const baseStats = { Health: 50, Strength: 5, Speed: 8 };

    const snapshot1 = toSnapshot(engine, item, baseStats);
    const snapshot2 = toSnapshot(engine, item, baseStats);

    expect(snapshot1).toEqual(snapshot2);
  });

  it("can be serialized to JSON cleanly", () => {
    const item = engine
      .builder("SerializablePlayer")
      .set("State", "Active")
      .set("Level", 15)
      .set("Enchanted", true)
      .increase("Health")
      .by(35)
      .build();

    const snapshot = toSnapshot(engine, item, {
      Health: 80,
      Strength: 12,
      Speed: 6,
    });
    const json = JSON.stringify(snapshot);
    const parsed = JSON.parse(json);

    expect(parsed.name).toBe("SerializablePlayer");
    expect(parsed.metrics.Health).toBe(115);
    expect(parsed.State).toBe("Active");
    expect(parsed.Level).toBe(15);
    expect(parsed.Enchanted).toBe(true);
  });
});
