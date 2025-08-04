import {
  defineConfig,
  createEngine,
  builtinOps,
  type BuiltinOperation,
} from "../src/index.js";

// Demonstrate different ways to use builtinOps with TypeScript safety

console.log("=== Built-in Operations Demo ===\n");

// 1. All built-in operations
const config1 = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: builtinOps("sum", "subtract", "multiply"),
  attributes: [] as const,
});

// 2. Subset of operations
const config2 = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: builtinOps("sum", "multiply"), // Only sum and multiply
  attributes: [] as const,
});

// 3. Mixed with custom operations
const config3 = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: [...builtinOps("sum", "multiply"), "customOp"] as const,
  attributes: [] as const,
});

// 4. Just one operation
const config4 = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: builtinOps("sum"),
  attributes: [] as const,
});

// Test that engines work correctly
const engine1 = createEngine(config1);
const engine2 = createEngine(config2);
const engine4 = createEngine(config4);

// Build some test items
const item1 = engine1
  .builder("Test Item 1")
  .increase("Health")
  .by(50)
  .multiply("Health")
  .by(1.2)
  .decrease("Damage")
  .by(5) // decrease() uses "subtract" operation
  .build();

const item2 = engine2
  .builder("Test Item 2")
  .increase("Health")
  .by(30)
  .multiply("Health")
  .by(1.5)
  // Note: decrease/subtract not available in config2
  .build();

const item4 = engine4
  .builder("Test Item 4")
  .increase("Health")
  .by(25)
  // Note: multiply not available in config4
  .build();

// Evaluate and show results
console.log("Engine 1 (all ops):", engine1.evaluate(item1).metrics);
console.log("Engine 2 (sum+multiply):", engine2.evaluate(item2).metrics);
console.log("Engine 4 (sum only):", engine4.evaluate(item4).metrics);

// Demonstrate type checking - these would be TypeScript errors:
// builtinOps("invalid"); // TS Error: not a built-in operation
// builtinOps("sum", "invalid"); // TS Error: second arg not valid

console.log("\n✅ Built-in operations demo completed successfully!");
