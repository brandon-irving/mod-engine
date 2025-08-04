import {
  defineConfig,
  createEngine,
  createEngineBuilder,
  builtinOps,
  type OperationImpl,
} from "../src/index.js";

console.log("=== Enforced Operation Registration Demo ===\n");

// Define config with custom operations
const config = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: [...builtinOps("sum", "multiply"), "power", "cap"] as const,
  attributes: [
    {
      key: "Level",
      kind: "number",
      min: 1,
      max: 100,
      integer: true,
    },
  ] as const,
});

// Define custom operations
const powerOp: OperationImpl<typeof config> = (current, value) =>
  Math.pow(current, value);

const capOp: OperationImpl<typeof config> = (current, value, context) => {
  const level = (context.item.attributes.Level as number) || 1;
  const maxAllowed = level * 10;
  return Math.min(current + value, maxAllowed);
};

console.log("🚫 Approach 1: Runtime Validation (Default Strict Mode)");
console.log("━".repeat(50));

try {
  // This will FAIL because custom operations aren't registered
  const engine1 = createEngine(config); // strictOperations: true by default
  console.log("❌ This shouldn't happen - validation should have failed!");
} catch (error) {
  console.log("✅ Caught missing operations error:");
  console.log(`   ${(error as Error).message}\n`);
}

console.log("✅ Approach 1b: Register operations after creation");
console.log("━".repeat(50));

try {
  // Create engine with strict mode disabled, then register
  const engine1b = createEngine(config, { strictOperations: false });

  // Register the operations
  engine1b.registerOperation?.("power", powerOp, { precedence: 25 });
  engine1b.registerOperation?.("cap", capOp, { precedence: 5 });

  // Now we can use it
  const item = engine1b
    .builder("Test Item")
    .set("Level", 5)
    .increase("Health")
    .by(10)
    .apply("Health", "power")
    .by(2)
    .build();

  const result = engine1b.evaluate(item);
  console.log("✅ Engine works! Health:", result.metrics.Health, "\n");
} catch (error) {
  console.log("❌ Error:", (error as Error).message);
}

console.log("🛡️  Approach 2: Type-Safe Engine Builder (Recommended)");
console.log("━".repeat(50));

try {
  // Type-safe builder approach
  const engine2 = createEngineBuilder(config)
    .withOperation("power", powerOp, { precedence: 25 })
    .withOperation("cap", capOp, { precedence: 5 })
    .build(); // ✅ All operations registered!

  const item2 = engine2
    .builder("Builder Test")
    .set("Level", 8)
    .increase("Damage")
    .by(5)
    .apply("Damage", "power")
    .by(2)
    .apply("Health", "cap")
    .by(100)
    .build();

  const result2 = engine2.evaluate(item2);
  console.log("✅ Builder approach works!");
  console.log("   Health:", result2.metrics.Health);
  console.log("   Damage:", result2.metrics.Damage, "\n");
} catch (error) {
  console.log("❌ Builder error:", (error as Error).message);
}

console.log("🔧 Approach 3: Bulk Registration");
console.log("━".repeat(50));

try {
  // Register multiple operations at once
  const engine3 = createEngineBuilder(config)
    .withOperations({
      power: { impl: powerOp, precedence: 25 },
      cap: { impl: capOp, precedence: 5 },
    })
    .build();

  const item3 = engine3
    .builder("Bulk Test")
    .set("Level", 3)
    .increase("Health")
    .by(2)
    .apply("Health", "power")
    .by(3) // 2^3 = 8
    .apply("Health", "cap")
    .by(50) // cap at level*10 = 30, so min(8+50, 30) = 30
    .build();

  const result3 = engine3.evaluate(item3);
  console.log(
    "✅ Bulk registration works! Health:",
    result3.metrics.Health,
    "\n"
  );
} catch (error) {
  console.log("❌ Bulk error:", (error as Error).message);
}

console.log("❌ Approach 4: What happens if you forget an operation");
console.log("━".repeat(50));

try {
  // This will fail because we only register 'power' but config declares both 'power' and 'cap'
  const engine4 = createEngineBuilder(config)
    .withOperation("power", powerOp, { precedence: 25 })
    // Missing .withOperation("cap", ...)
    .build();

  console.log("❌ This shouldn't happen - should have failed!");
} catch (error) {
  console.log("✅ Caught incomplete registration:");
  console.log(`   ${(error as Error).message}\n`);
}

console.log("📝 SUMMARY:");
console.log(
  "1. createEngine() now validates operations by default (strictOperations: true)"
);
console.log(
  "2. createEngineBuilder() provides type-safe operation registration"
);
console.log(
  "3. Both approaches prevent runtime errors from missing operations"
);
console.log(
  "4. Builder pattern is recommended for better developer experience"
);
console.log("\n✅ Operation enforcement demo completed!");
