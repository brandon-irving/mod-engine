# RPG SDK

A type-safe, developer-friendly SDK for building RPG systems with dynamic item modifiers and complex attribute evaluation.

## What is this?

The RPG SDK provides a complete toolkit for creating RPG items with sophisticated modification systems. Think of it as a rules engine for item stats that handles complex scenarios like conditional modifiers, stacking rules, and attribute-based calculations.

### Key Features

- **🎯 Type-Safe** - Full TypeScript support with intelligent autocompletion
- **⚡ Simple API** - Build and evaluate items with just a few function calls
- **🔧 Flexible Modifiers** - Support for conditional logic, priority ordering, and stacking rules
- **📊 Rich Metrics** - Health, Damage, Defense, Speed, and more with customizable base values
- **🎮 Game-Ready** - Pre-configured for common RPG patterns and easily extensible

## Quick Start

```typescript
import {
  createModifier,
  quickEvaluate,
  DEFAULT_ITEM_STATE,
} from "@/lib/rpg-sdk";

// Create a simple fire sword with damage bonus
const result = quickEvaluate(
  { ...DEFAULT_ITEM_STATE, itemName: "Fire Sword", enchanted: true },
  [
    createModifier({ metric: "Damage", operation: "sum", value: 50 }),
    createModifier({
      metric: "Damage",
      operation: "multiply",
      value: 1.5,
      hasCondition: true,
      condition: { attribute: "Enchanted", operation: "eq", value: true },
    }),
  ]
);

console.log(result.metrics);
// { Health: 10, Damage: 85, Defense: 10, ... }
```

## Core Concepts

### Items

Items have attributes like name, rarity, enchantment status, and level that influence how modifiers are applied.

### Modifiers

Modifiers change item metrics through operations like `sum`, `subtract`, or `multiply`. They can be conditional (only apply when certain attributes match) and have priority ordering for complex stacking rules.

### Evaluation

The evaluation engine processes all modifiers according to their conditions and priorities, producing final metric values with a complete audit trail.

## API Reference

### Essential Functions

#### `quickEvaluate(itemState, modifiers)`

Build and evaluate an item in one call - perfect for simple use cases.

#### `createModifier(options)`

Create a new modifier with intelligent defaults.

```typescript
const modifier = createModifier({
  metric: "Health",
  operation: "sum",
  value: 100,
});
```

#### `buildItem(itemState, modifiers)`

Build a complete item specification from state and modifiers.

#### `evaluateItem(item)`

Evaluate an item against default base metrics to get final values.

### Smart Condition Helper

#### `makeCondition(operation, attribute, value)`

Create type-safe conditions for modifiers without worrying about complex typing.

```typescript
// This is fully type-checked at compile time
const condition = makeCondition("eq", "Rarity", "Legendary");
```

### UI Helpers

#### `getDefaultValueForAttribute(attribute)`

Get appropriate default values for any attribute type.

#### `getInputTypeForAttribute(attribute)`

Determine the best UI input type (checkbox, select, number, text) for an attribute.

#### `getMetricColor(value)` & `formatMetricValue(value)`

Format metrics for display with appropriate colors and precision.

## Working with Types

### ItemState

```typescript
interface ItemState {
  itemName: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  tags: ("Weapon" | "Armor" | "Accessory" | "Consumable")[];
  level: number; // 1-100
  enchanted: boolean;
  quality: number; // 1-100
  cursed: boolean;
  socketCount: number; // 0-6
}
```

### ModifierForm

```typescript
interface ModifierForm {
  id: string;
  metric: "Health" | "Damage" | "Defense" | "Speed" | "Strength" | "Mana";
  operation: "sum" | "subtract" | "multiply";
  value: number;
  priority: number; // Higher = applied later
  hasCondition: boolean;
  condition?: {
    attribute: AttributeKey;
    operation: "eq" | "gt" | "gte" | "lt" | "lte" | "includes";
    value: any;
  };
  stacking: "default" | "unique";
  source?: string; // For unique stacking identification
}
```

## Advanced Examples

### Conditional Modifiers

```typescript
// Bonus damage for legendary weapons
const legendaryBonus = createModifier({
  metric: "Damage",
  operation: "multiply",
  value: 2.0,
  hasCondition: true,
  condition: makeCondition("eq", "Rarity", "Legendary"),
});

// Speed penalty for heavy armor
const armorPenalty = createModifier({
  metric: "Speed",
  operation: "multiply",
  value: 0.8,
  hasCondition: true,
  condition: makeCondition("includes", "Tags", "Armor"),
});
```

### Priority and Stacking

```typescript
// Base damage increase (applied first, priority 0)
const baseDamage = createModifier({
  metric: "Damage",
  operation: "sum",
  value: 50,
  priority: 0,
});

// Percentage increase (applied after base, priority 10)
const percentBonus = createModifier({
  metric: "Damage",
  operation: "multiply",
  value: 1.5,
  priority: 10,
});

// Unique enchantment (only one of this type can apply)
const fireEnchant = createModifier({
  metric: "Damage",
  operation: "sum",
  value: 25,
  stacking: "unique",
  source: "Fire Enchantment",
});
```

### Dynamic UI Components

```typescript
function AttributeInput({ attribute, value, onChange }) {
  const inputType = getInputTypeForAttribute(attribute);
  const attrDef = ATTRIBUTE_DEFINITIONS[attribute];

  if (inputType === "select" && attrDef.kind === "enum") {
    return (
      <select value={value} onChange={onChange}>
        {attrDef.values.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (inputType === "checkbox") {
    return <input type="checkbox" checked={value} onChange={onChange} />;
  }

  // Handle number/text inputs...
}
```

## Constants & Configuration

- `DEFAULT_BASE_METRICS` - All metrics start at 10
- `DEFAULT_ITEM_STATE` - Sensible defaults for new items
- `METRIC_ICONS` - Emoji icons for each metric type
- `ATTRIBUTE_DEFINITIONS` - Complete type information for all attributes
- `rpgEngine` - Configured mod-engine instance
- `rpgConfig` - The complete engine configuration

## Why Use This SDK?

**Instead of this complexity:**

```typescript
// Raw mod-engine usage
const config = defineConfig({
  metrics: ["Health", "Damage" /* ... */],
  operations: ["sum", "subtract", "multiply"],
  attributes: [
    { key: "Rarity", kind: "enum", values: ["Common" /*...*/] },
    // ... dozens more lines
  ],
});

const engine = new Engine(config);
const builder = engine
  .builder("My Item")
  .set("Rarity", "Epic")
  .when({ op: "eq", attr: "Rarity", value: "Epic" as any })
  .with({ priority: 10 })
  .increase("Damage")
  .by(50);
// ... lots more manual setup
```

**You get this simplicity:**

```typescript
// RPG SDK usage
const result = quickEvaluate(itemState, [
  createModifier({ metric: "Damage", operation: "sum", value: 50 }),
]);
```

The SDK handles all the configuration, type safety, and complex builder patterns for you while still giving you access to the full power of the underlying mod-engine when needed.
