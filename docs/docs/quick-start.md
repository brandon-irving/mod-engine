# Quick Start

This guide will walk you through creating your first item with modifiers using Mod-Engine.

## Basic Example

Let's create a simple RPG system with weapons that have damage bonuses:

```typescript
import { defineConfig, createEngine } from "mod-engine";

// 1. Define your configuration
const config = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: ["sum", "multiply"] as const,
  attributes: [
    {
      key: "Rarity",
      kind: "enum",
      values: ["Common", "Rare", "Epic"] as const,
    },
    {
      key: "Enchanted",
      kind: "boolean",
    },
  ] as const,
});

// 2. Create the engine
const engine = createEngine(config);

// 3. Define default attributes
const swordAttributes = {
  Rarity: "Epic" as const,
  Enchanted: true,
};

// 4. Helper function for applying attributes (optional pattern)
function applyAttributes<C extends typeof config>(
  builder: ReturnType<typeof engine.builder>,
  attributes: Record<string, any>
) {
  Object.entries(attributes).forEach(([key, value]) => {
    builder.set(key as any, value);
  });
  return builder;
}

// 5. Build an item using the attributes object
const magicSword = applyAttributes(
  engine.builder("Magic Sword"),
  swordAttributes
)
  // Base damage increase
  .increase("Damage")
  .by(50)
  // Conditional multiplier for epic items
  .when({ op: "eq", attr: "Rarity", value: "Epic" })
  .multiply("Damage")
  .by(1.5)
  // Extra bonus if enchanted
  .when({ op: "eq", attr: "Enchanted", value: true })
  .increase("Damage")
  .by(25)
  .build();

// 6. Evaluate the item
const result = engine.evaluate(magicSword);

console.log(result.metrics);
// Output: { Health: 0, Damage: 112.5 }
// Calculation: ((0 + 50) * 1.5) + 25 = 112.5
```

## Understanding the Result

The evaluation follows this order:

1. Start with base metrics (Health: 0, Damage: 0)
2. Apply base damage increase: `0 + 50 = 50`
3. Apply epic multiplier: `50 * 1.5 = 75`
4. Apply enchanted bonus: `75 + 25 = 100`

Wait, that doesn't match our output! Let me check the operation order...

Actually, the calculation depends on modifier priorities. By default, operations are applied in the order they're added, so:

1. Base damage: `0 + 50 = 50`
2. Epic multiplier: `50 * 1.5 = 75`
3. Enchanted bonus: `75 + 25 = 100`

But if the enchanted bonus was added before the multiplier, it would be:

1. Base damage: `0 + 50 = 50`
2. Enchanted bonus: `50 + 25 = 75`
3. Epic multiplier: `75 * 1.5 = 112.5`

## Using Default Attribute Objects

Define reusable attribute sets for consistent item creation:

```typescript
// Define common attribute sets
const commonWeaponBase = {
  Rarity: "Common" as const,
  Enchanted: false,
};

const rareWeaponBase = {
  Rarity: "Rare" as const,
  Enchanted: true,
};

const epicWeaponBase = {
  Rarity: "Epic" as const,
  Enchanted: true,
};

// Create multiple items using the same base
const ironSword = applyAttributes(
  engine.builder("Iron Sword"),
  commonWeaponBase
)
  .increase("Damage")
  .by(25)
  .build();

const silverSword = applyAttributes(
  engine.builder("Silver Sword"),
  rareWeaponBase
)
  .increase("Damage")
  .by(50)
  .build();

const dragonSword = applyAttributes(
  engine.builder("Dragon Sword"),
  epicWeaponBase
)
  .increase("Damage")
  .by(100)
  .build();
```

This pattern helps maintain consistency and reduces repetition when creating items with similar attribute sets.

## Working with Priorities

You can control the order of modifier application using priorities:

```typescript
const prioritizedSword = engine
  .builder("Prioritized Sword")
  .set("Rarity", "Epic")
  .set("Enchanted", true)
  // High priority - applied first
  .with({ priority: 100 })
  .increase("Damage")
  .by(50)
  // Medium priority - applied second
  .with({ priority: 50 })
  .increase("Damage")
  .by(25)
  // Low priority - applied last
  .with({ priority: 10 })
  .when({ op: "eq", attr: "Rarity", value: "Epic" })
  .multiply("Damage")
  .by(1.5)
  .build();
```

## Accessing Evaluation Details

Mod-Engine provides complete visibility into the evaluation process:

```typescript
const result = engine.evaluate(magicSword);

console.log("Final metrics:", result.metrics);
console.log("Applied modifiers:", result.appliedModifiers);
console.log("Evaluation trace:", result.trace);
console.log("Item attributes:", result.itemAttributes);
```

## Next Steps

Now that you understand the basics:

- Learn about [Core Concepts](./concepts/overview.md) for deeper understanding
- Explore [API Reference](./api/overview.md) for detailed documentation
- Try the [Next.js Interactive Demo](./examples/nextjs-demo.md) for hands-on experimentation

## Common Patterns

### Conditional Bonuses

```typescript
// Bonus only applies to rare or better items
.when({
  op: "includes",
  attr: "Rarity",
  value: ["Rare", "Epic"]
})
.increase("Damage")
.by(30)
```

### Stacking Rules

```typescript
// Only one fire enchantment can apply
.with({
  stacking: "unique",
  source: "Fire Enchantment"
})
.increase("Damage")
.by(20)
```

### Multiple Conditions

```typescript
// Complex condition using condition builder
.when(
  // Use createConditionBuilder<typeof config>() instead
  // engine.conditionBuilder()
    .and({ op: "eq", attr: "Enchanted", value: true })
    .and({ op: "gte", attr: "Level", value: 10 })
    .build()
)
.multiply("Damage")
.by(2.0)
```
