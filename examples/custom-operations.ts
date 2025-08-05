import {
  defineConfig,
  createEngine,
  builtinOps,
  type OperationImpl,
} from "../src/index";

console.log("=== Custom Operations Demo ===\n");

// Create a config that includes space for custom operations
const config = defineConfig({
  metrics: ["Health", "Damage", "Speed"] as const,
  operations: [
    ...builtinOps("sum", "multiply"),
    "pow",
    "min",
    "max",
    "clamp",
  ] as const,
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

const engine = createEngine(config);

// Define custom operations with their computational logic
console.log("Registering custom operations...\n");

// 1. Power operation: raises current value to the power of modifier value
const powerOperation: OperationImpl<typeof config> = (
  current,
  value,
  context
) => {
  console.log(`  Power: ${current}^${value} = ${Math.pow(current, value)}`);
  return Math.pow(current, value);
};

// 2. Min operation: takes minimum of current and modifier value
const minOperation: OperationImpl<typeof config> = (
  current,
  value,
  context
) => {
  const result = Math.min(current, value);
  console.log(`  Min: min(${current}, ${value}) = ${result}`);
  return result;
};

// 3. Max operation: takes maximum of current and modifier value
const maxOperation: OperationImpl<typeof config> = (
  current,
  value,
  context
) => {
  const result = Math.max(current, value);
  console.log(`  Max: max(${current}, ${value}) = ${result}`);
  return result;
};

// 4. Clamp operation: uses context to clamp value based on item's Level attribute
const clampOperation: OperationImpl<typeof config> = (
  current,
  value,
  context
) => {
  const level = (context.item.attributes.Level as number) || 1;
  const maxAllowed = level * 10; // Max health = level * 10
  const result = Math.min(current + value, maxAllowed);
  console.log(
    `  Clamp: min(${current} + ${value}, ${maxAllowed}) = ${result} (Level ${level} cap)`
  );
  return result;
};

// Register operations with precedence values
engine.registerOperation?.("pow", powerOperation, { precedence: 30 }); // High precedence
engine.registerOperation?.("min", minOperation, { precedence: 15 }); // Medium precedence
engine.registerOperation?.("max", maxOperation, { precedence: 15 }); // Medium precedence
engine.registerOperation?.("clamp", clampOperation, { precedence: 5 }); // Low precedence

// Test 1: Power operation
console.log("=== Test 1: Power Operation ===");
const powerItem = engine
  .builder("Power Test")
  .set("Level", 5)
  .increase("Damage")
  .by(3) // Start with 3
  .apply("Damage", "pow")
  .by(2) // 3^2 = 9
  .build();

const powerResult = engine.evaluate(powerItem);
console.log("Final Damage:", powerResult.metrics.Damage, "\n");

// Test 2: Min/Max operations
console.log("=== Test 2: Min/Max Operations ===");
const minMaxItem = engine
  .builder("MinMax Test")
  .set("Level", 10)
  .increase("Health")
  .by(100) // Start with 100
  .apply("Health", "min")
  .by(50) // min(100, 50) = 50
  .apply("Health", "max")
  .by(75) // max(50, 75) = 75
  .build();

const minMaxResult = engine.evaluate(minMaxItem);
console.log("Final Health:", minMaxResult.metrics.Health, "\n");

// Test 3: Context-aware clamp operation
console.log("=== Test 3: Context-Aware Clamp ===");
const clampItem = engine
  .builder("Clamp Test")
  .set("Level", 8) // Level 8 = max 80 health
  .apply("Health", "clamp")
  .by(100) // Tries to add 100, but clamped to 80
  .build();

const clampResult = engine.evaluate(clampItem);
console.log("Final Health:", clampResult.metrics.Health, "\n");

// Test 4: Precedence demonstration
console.log("=== Test 4: Operation Precedence ===");
console.log("Operations will apply in precedence order:");
console.log("- clamp (precedence 5) - lowest, applied first");
console.log("- sum (precedence 10) - built-in");
console.log("- min/max (precedence 15) - medium");
console.log("- multiply (precedence 20) - built-in");
console.log("- pow (precedence 30) - highest, applied last\n");

const precedenceItem = engine
  .builder("Precedence Test")
  .set("Level", 5)
  .increase("Speed")
  .by(2) // sum: 0 + 2 = 2
  .apply("Speed", "pow")
  .by(2) // pow: 2^2 = 4 (applied last)
  .apply("Speed", "max")
  .by(3) // max: max(result_of_sum, 3)
  .multiply("Speed")
  .by(2) // multiply: result * 2
  .build();

const precedenceResult = engine.evaluate(precedenceItem);
console.log("Final Speed:", precedenceResult.metrics.Speed);
console.log("Applied modifiers:", precedenceResult.applied.length);

console.log("\n✅ Custom operations demo completed!");
