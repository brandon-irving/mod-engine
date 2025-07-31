import {
  defineConfig,
  createEngine,
  serializeItem,
  toJSON,
} from "../dist/index.mjs";

// Define the configuration for an RPG item system
const config = defineConfig({
  metrics: ["Health", "Strength", "Speed", "Mana"],
  operations: ["sum", "subtract", "multiply"],
  attributes: [
    {
      key: "Rarity",
      kind: "enum",
      values: ["Common", "Rare", "Epic", "Legendary"],
      cardinality: "single",
    },
    {
      key: "Tags",
      kind: "enum",
      values: ["Weapon", "Armor", "Consumable", "Accessory"],
      cardinality: "multi",
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
    {
      key: "ItemName",
      kind: "string",
      minLen: 1,
      maxLen: 50,
    },
  ],
});

// Create the engine
const engine = createEngine(config);

// Example 1: Basic item with simple modifiers
console.log("=== Example 1: Basic Item ===");
const basicSword = engine
  .builder("Iron Sword")
  .set("Rarity", "Common")
  .set("Tags", ["Weapon"])
  .set("Level", 10)
  .set("Enchanted", false)
  .set("ItemName", "Iron Sword")
  .increase("Health")
  .by(25)
  .increase("Strength")
  .by(15)
  .increase("Speed")
  .by(5)
  .build();

const basicResult = engine.evaluate(basicSword);
console.log("Basic Sword Metrics:", basicResult.metrics);
console.log("Applied Modifiers:", basicResult.applied.length);

// Example 2: Conditional modifiers
console.log("\n=== Example 2: Conditional Item ===");
const magicSword = engine
  .builder("Magic Sword")
  .set("Rarity", "Epic")
  .set("Tags", ["Weapon"])
  .set("Level", 50)
  .set("Enchanted", true)
  .set("ItemName", "Flaming Blade")
  .increase("Health")
  .by(100)
  .increase("Strength")
  .by(50)
  .increase("Speed")
  .by(20)
  // Conditional bonus for enchanted items
  .when({ op: "eq", attr: "Enchanted", value: true })
  .multiply("Strength")
  .by(1.5)
  // Conditional bonus for Epic rarity
  .when({ op: "eq", attr: "Rarity", value: "Epic" })
  .increase("Health")
  .by(75)
  .increase("Mana")
  .by(50)
  .build();

const magicResult = engine.evaluate(magicSword);
console.log("Magic Sword Metrics:", magicResult.metrics);
console.log("Applied Modifiers:", magicResult.applied.length);

// Example 3: Stacking rules demonstration
console.log("\n=== Example 3: Stacking Rules ===");
const complexItem = engine
  .builder("Complex Item")
  .set("Rarity", "Legendary")
  .set("Tags", ["Weapon", "Accessory"])
  .set("Level", 75)
  .set("Enchanted", true)
  .set("ItemName", "Artifact Blade")
  // Multiple modifiers that stack
  .increase("Health")
  .by(50)
  .increase("Health")
  .by(30)
  .increase("Health")
  .by(20)
  // Modifiers with different priorities
  .with({ priority: 10 })
  .multiply("Health")
  .by(1.2)
  .with({ priority: 5 })
  .multiply("Health")
  .by(1.1)
  // Unique stacking modifier
  .with({ stacking: "unique", source: "legendary-bonus" })
  .increase("Strength")
  .by(100)
  .with({ stacking: "unique", source: "legendary-bonus" })
  .increase("Strength")
  .by(80) // This should not apply due to unique stacking
  .build();

const complexResult = engine.evaluate(complexItem);
console.log("Complex Item Metrics:", complexResult.metrics);
console.log("Applied Modifiers:", complexResult.applied.length);

// Example 4: Validation
console.log("\n=== Example 4: Validation ===");
const validationResult = engine.validateItem(magicSword);
console.log("Validation Result:", validationResult.ok ? "VALID" : "INVALID");
if (!validationResult.ok) {
  console.log("Errors:", validationResult.errors);
}

// Example 5: Serialization
console.log("\n=== Example 5: Serialization ===");
const serialized = serializeItem(magicSword);
const jsonString = toJSON(serialized);
console.log("Serialized Size:", jsonString.length, "characters");
console.log("JSON Preview:", jsonString.substring(0, 100) + "...");

console.log("\n=== All Examples Complete ===");
