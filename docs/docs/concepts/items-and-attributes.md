# Items and Attributes

Items in Mod-Engine are objects with named attributes that describe their properties. These attributes are used by modifiers to determine when and how to apply changes.

## Attribute Types

### Enum Attributes

Fixed sets of possible values, perfect for categories like rarity or type:

```typescript
{
  key: "Rarity",
  kind: "enum",
  values: ["Common", "Rare", "Epic", "Legendary"] as const,
}
```

Usage in conditions:

```typescript
// Exact match
.when({ op: "eq", attr: "Rarity", value: "Epic" })

// Multiple values
.when({ op: "includes", attr: "Rarity", value: ["Epic", "Legendary"] })
```

### Boolean Attributes

Simple true/false values:

```typescript
{
  key: "Enchanted",
  kind: "boolean",
}
```

Usage:

```typescript
.when({ op: "eq", attr: "Enchanted", value: true })
```

### Number Attributes

Numeric values with optional constraints:

```typescript
{
  key: "Level",
  kind: "number",
  min: 1,
  max: 100,
}
```

Usage with comparisons:

```typescript
// Greater than or equal
.when({ op: "gte", attr: "Level", value: 50 })

// Range checks
.when({ op: "gt", attr: "Level", value: 10 })
.when({ op: "lt", attr: "Level", value: 90 })
```

### String Attributes

Text values with optional validation:

```typescript
{
  key: "Name",
  kind: "string",
  pattern: "^[A-Za-z ]+$", // Letters and spaces only
}
```

## Setting Attributes

Use the builder to set item attributes:

```typescript
const item = engine
  .builder("Magic Sword")
  .set("Rarity", "Epic")
  .set("Level", 50)
  .set("Enchanted", true)
  .set("Name", "Excalibur")
  .build();
```

## Attribute Validation

Mod-Engine validates attributes at build time:

```typescript
// ❌ This will throw an error
.set("Rarity", "Invalid") // Not in enum values

// ❌ This will throw an error
.set("Level", 150) // Exceeds max value

// ✅ This is valid
.set("Rarity", "Legendary")
.set("Level", 75)
```

## Dynamic Attributes

Attributes can be calculated based on other attributes:

```typescript
// Set base level
.set("Level", 50)
// Enchanted items get +10 levels
.when({ op: "eq", attr: "Enchanted", value: true })
.set("EffectiveLevel", (ctx) => ctx.attributes.Level + 10)
```

## Multi-Value Attributes

Some attributes can hold multiple values:

```typescript
{
  key: "Tags",
  kind: "enum",
  values: ["Weapon", "Armor", "Accessory", "Consumable"] as const,
  cardinality: { min: 1, max: 3 }, // 1-3 tags allowed
}
```

Usage:

```typescript
.set("Tags", ["Weapon", "Accessory"])
.when({ op: "includes", attr: "Tags", value: "Weapon" })
.increase("Damage").by(10)
```

## Conditional Attribute Setting

Set attributes conditionally:

```typescript
const item = engine
  .builder("Conditional Item")
  .set("BaseRarity", "Common")
  // Upgrade rarity if certain conditions are met
  .when({ op: "gte", attr: "Level", value: 50 })
  .set("Rarity", "Epic")
  .otherwise()
  .set("Rarity", (ctx) => ctx.attributes.BaseRarity)
  .build();
```

## Best Practices

### 1. Use Descriptive Names

```typescript
// ❌ Unclear
{ key: "T", kind: "enum", values: ["A", "B"] }

// ✅ Clear
{ key: "ItemType", kind: "enum", values: ["Weapon", "Armor"] }
```

### 2. Set Reasonable Constraints

```typescript
// Level bounds
{ key: "Level", kind: "number", min: 1, max: 100 }

// Quality percentage
{ key: "Quality", kind: "number", min: 0, max: 100 }
```

### 3. Group Related Attributes

```typescript
// Combat-related
{ key: "AttackSpeed", kind: "number", min: 0.1, max: 5.0 }
{ key: "CriticalChance", kind: "number", min: 0, max: 100 }

// Durability-related
{ key: "MaxDurability", kind: "number", min: 1, max: 1000 }
{ key: "CurrentDurability", kind: "number", min: 0, max: 1000 }
```

## Common Patterns

### Rarity System

```typescript
{
  key: "Rarity",
  kind: "enum",
  values: ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const
}
```

### Quality System

```typescript
{
  key: "Quality",
  kind: "number",
  min: 1,
  max: 100,
  default: 50
}
```

### Equipment Slots

```typescript
{
  key: "Slot",
  kind: "enum",
  values: ["Head", "Chest", "Legs", "Feet", "Hands", "Ring", "Necklace"] as const
}
```
