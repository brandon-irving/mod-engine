# Builder API

The Builder provides a fluent interface for creating item specifications with type-safe attribute setting and modifier application.

## Class: Builder&lt;C&gt;

A fluent builder for creating item specifications with compile-time type safety.

### Constructor

```typescript
new Builder<C>(config: C, name?: string)
```

Typically created through `engine.builder()` rather than directly.

## Attribute Methods

### set()

Sets an attribute value with full type safety.

```typescript
set<K extends AttrKeyOf<C>>(key: K, value: AttrValueOf<C, K>): Builder<C>
```

#### Parameters

- `key` - Attribute key (validated against configuration)
- `value` - Attribute value (type-checked against attribute schema)

#### Example

```typescript
const attributeDefaults = {
  Rarity: "Epic" as const,
  Level: 50,
  Enchanted: true,
};

const item = engine
  .builder("Magic Sword")
  .set("Rarity", attributeDefaults.Rarity)
  .set("Level", attributeDefaults.Level)
  .set("Enchanted", attributeDefaults.Enchanted)
  .build();
```

## Modifier Methods

### increase()

Adds a sum operation modifier to increase a metric.

```typescript
increase<M extends MetricOf<C>>(metric: M): { by(value: number): Builder<C> }
```

#### Example

```typescript
const item = engine.builder("Sword").increase("Damage").by(50).build();
```

### decrease()

Adds a subtract operation modifier to decrease a metric.

```typescript
decrease<M extends MetricOf<C>>(metric: M): { by(value: number): Builder<C> }
```

#### Example

```typescript
const item = engine.builder("Cursed Item").decrease("Health").by(25).build();
```

### multiply()

Adds a multiply operation modifier to scale a metric.

```typescript
multiply<M extends MetricOf<C>>(metric: M): { by(value: number): Builder<C> }
```

#### Example

```typescript
const item = engine
  .builder("Legendary Weapon")
  .multiply("Damage")
  .by(1.5)
  .build();
```

### custom()

Adds a modifier with a custom operation.

```typescript
custom<M extends MetricOf<C>, O extends OperationOf<C>>(
  metric: M,
  operation: O
): { by(value: number): Builder<C> }
```

#### Example

```typescript
const item = engine
  .builder("Powered Item")
  .custom("Damage", "pow")
  .by(2)
  .build();
```

## Conditional Methods

### when()

Sets a condition for subsequent modifiers.

```typescript
when(condition: Condition<C>): Builder<C>
```

#### Condition Types

- `{ op: "eq", attr: K, value: V }` - Equality check
- `{ op: "gt", attr: K, value: V }` - Greater than
- `{ op: "gte", attr: K, value: V }` - Greater than or equal
- `{ op: "lt", attr: K, value: V }` - Less than
- `{ op: "lte", attr: K, value: V }` - Less than or equal
- `{ op: "includes", attr: K, value: V[] }` - Value in array

#### Example

```typescript
const item = engine
  .builder("Conditional Item")
  .set("Rarity", "Epic")
  // Only applies to Epic items
  .when({ op: "eq", attr: "Rarity", value: "Epic" })
  .multiply("Damage")
  .by(2.0)
  .build();
```

### clearConditions()

Removes all active conditions.

```typescript
clearConditions(): Builder<C>
```

## Metadata Methods

### with()

Sets metadata for subsequent modifiers.

```typescript
with(metadata: {
  stacking?: Stacking;
  priority?: number;
  source?: string;
}): Builder<C>
```

#### Parameters

- `stacking` - Stacking behavior ("default" | "unique")
- `priority` - Application priority (higher = applied later)
- `source` - Source identifier for unique stacking

#### Example

```typescript
const item = engine
  .builder("Prioritized Item")
  // High priority modifier applied last
  .with({ priority: 100 })
  .multiply("Damage")
  .by(1.5)
  // Unique modifier that can't stack
  .with({ stacking: "unique", source: "fire-enchant" })
  .increase("Damage")
  .by(25)
  .build();
```

### clearMeta()

Clears all current metadata (priority, stacking, source).

```typescript
clearMeta(): Builder<C>
```

## Grouping Methods

### group()

Groups modifiers with shared conditions and metadata.

```typescript
group(
  options: {
    when?: Condition<C>;
    with?: { stacking?: Stacking; priority?: number; source?: string };
  },
  fn: (builder: Builder<C>) => void
): Builder<C>
```

#### Example

```typescript
const item = engine
  .builder("Grouped Item")
  .group(
    {
      when: { op: "eq", attr: "Enchanted", value: true },
      with: { priority: 50 },
    },
    (builder) => {
      builder.increase("Damage").by(25).increase("Health").by(50);
    }
  )
  .build();
```

## Utility Methods

### build()

Creates the final immutable item specification.

```typescript
build(): ItemSpec<C>
```

#### Returns

An `ItemSpec<C>` containing:

- `name?` - Optional item name
- `attributes` - All set attributes
- `modifiers` - All added modifiers

### clone()

Creates a copy of the builder with the same state.

```typescript
clone(): Builder<C>
```

### reset()

Resets the builder to initial state.

```typescript
reset(): Builder<C>
```

### clearAttributes()

Removes all set attributes.

```typescript
clearAttributes(): Builder<C>
```

### clearModifiers()

Removes all added modifiers.

```typescript
clearModifiers(): Builder<C>
```

## Advanced Patterns

### Attribute Helper Function

Create a helper to apply multiple attributes:

```typescript
function applyAttributes<C extends ConfigSpec>(
  builder: Builder<C>,
  attributes: Record<string, any>
): Builder<C> {
  Object.entries(attributes).forEach(([key, value]) => {
    builder.set(key as any, value);
  });
  return builder;
}

// Usage
const warriorDefaults = {
  Class: "Warrior" as const,
  Level: 25,
  Strength: 18,
};

const warrior = applyAttributes(engine.builder("Warrior"), warriorDefaults)
  .increase("Health")
  .by(100)
  .build();
```

### Conditional Chains

Chain multiple conditions:

```typescript
const item = engine
  .builder("Complex Item")
  .when({ op: "eq", attr: "Rarity", value: "Legendary" })
  .multiply("Damage")
  .by(2.0)
  .when({ op: "gte", attr: "Level", value: 50 })
  .increase("Health")
  .by(100)
  .when({ op: "eq", attr: "Enchanted", value: true })
  .increase("Mana")
  .by(50)
  .build();
```

### Priority Ordering

Control modifier application order:

```typescript
const item = engine
  .builder("Ordered Item")
  // Applied first (highest priority)
  .with({ priority: 100 })
  .increase("Damage")
  .by(50)
  // Applied second
  .with({ priority: 50 })
  .multiply("Damage")
  .by(1.5)
  // Applied last (lowest priority)
  .with({ priority: 10 })
  .increase("Damage")
  .by(25)
  .build();
```

## Type Safety

The Builder provides complete compile-time type checking:

- Attribute keys must exist in configuration
- Attribute values must match schema types
- Metric names must be declared in configuration
- Operation names must be available

Invalid usage results in TypeScript compilation errors:

```typescript
// ❌ TypeScript error - invalid attribute
.set("InvalidAttr", "value")

// ❌ TypeScript error - invalid metric
.increase("InvalidMetric")

// ✅ Valid usage
.set("Rarity", "Epic")
.increase("Damage")
```
