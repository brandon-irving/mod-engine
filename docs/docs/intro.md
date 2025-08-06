# Introduction

Welcome to **Mod-Engine** - a powerful TypeScript library for building type-safe attribute and modifier systems with deterministic evaluation.

## What is Mod-Engine?

Mod-Engine provides a complete framework for creating complex item modification systems commonly found in RPGs, simulations, and other applications requiring dynamic attribute calculations. It offers:

- **🎯 Type Safety** - Full TypeScript support with intelligent autocompletion
- **⚡ Performance** - Optimized evaluation engine with minimal overhead
- **🔧 Flexibility** - Support for complex conditions, priorities, and stacking rules
- **📊 Deterministic** - Consistent, reproducible results every time
- **🛠️ Developer Friendly** - Intuitive API with comprehensive error handling

## Key Features

### Type-Safe Configuration

Define your metrics, operations, and attributes with full TypeScript support:

```typescript
const config = defineConfig({
  metrics: ["Health", "Damage", "Defense"] as const,
  operations: ["sum", "multiply", "subtract"] as const,
  attributes: [
    {
      key: "Rarity",
      kind: "enum",
      values: ["Common", "Rare", "Epic", "Legendary"] as const,
    },
  ] as const,
});
```

### Flexible Modifier System

Create modifiers with conditional logic and priority ordering:

```typescript
const sword = engine
  .builder("Legendary Sword")
  .set("Rarity", "Legendary")
  .increase("Damage")
  .by(100)
  .when({ op: "eq", attr: "Rarity", value: "Legendary" })
  .multiply("Damage")
  .by(1.5)
  .build();
```

### Deterministic Evaluation

Get consistent results with complete audit trails:

```typescript
const result = engine.evaluate(sword);
console.log(result.metrics); // { Health: 0, Damage: 150, Defense: 0 }
console.log(result.trace); // Complete evaluation history
```

## Use Cases

Mod-Engine is perfect for:

- **RPG Systems** - Character stats, equipment bonuses, spell effects
- **Game Development** - Item modifications, buff/debuff systems
- **Simulation** - Dynamic property calculations with complex rules
- **Configuration Systems** - Type-safe rule engines with validation

## Getting Started

Ready to dive in? Check out our [Installation Guide](./installation.md) and [Quick Start](./quick-start.md) to begin building with Mod-Engine.

For a complete working example, try our [Next.js Interactive Demo](./examples/nextjs-demo.md).
