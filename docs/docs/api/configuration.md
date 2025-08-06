# Configuration API

This module provides functions for defining and creating mod-engine configurations and engines.

## defineConfig

Creates a strongly-typed configuration specification.

### Signature

```typescript
function defineConfig<const C extends ConfigSpec>(config: C): C;
```

### Parameters

- `config` - Configuration object containing metrics, operations, and attributes

### Returns

The same configuration object with enhanced type information for compile-time safety.

### Example

```typescript
import { defineConfig } from "mod-engine";

const config = defineConfig({
  metrics: ["Health", "Damage", "Defense"] as const,
  operations: ["sum", "multiply", "subtract"] as const,
  attributes: [
    {
      key: "Rarity",
      kind: "enum",
      values: ["Common", "Rare", "Epic", "Legendary"] as const,
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
```

### Configuration Structure

#### Metrics

Array of metric names that can be modified:

```typescript
metrics: readonly string[]
```

#### Operations

Array of operation names that can be applied:

```typescript
operations: readonly string[]
```

#### Attributes

Array of attribute schemas that define item properties:

```typescript
attributes: readonly AttributeSchema[]
```

### Validation

The function automatically validates the configuration and throws `ValidationError` if:

- Metrics array is empty
- Operations array is empty
- Attribute schemas are malformed
- Duplicate metric or attribute names exist

---

## createEngine

Creates an engine instance from a configuration.

### Signature

```typescript
function createEngine<const C extends ConfigSpec>(
  config: C,
  options?: { strictOperations?: boolean }
): Engine<C>;
```

### Parameters

- `config` - Configuration object from `defineConfig()`
- `options` - Optional configuration:
  - `strictOperations` - Whether to validate all operations have implementations (default: true)

### Returns

An `Engine<C>` instance with the following methods:

#### `builder(name?: string): Builder&lt;C&gt;`

Creates a new item builder.

#### `evaluate(item: ItemSpec&lt;C&gt;, options?: { base?: Partial&lt;Record&lt;MetricOf&lt;C&gt;, number&gt;&gt; }): EvaluationResult&lt;C&gt;`

Evaluates an item and returns final metrics.

#### `validateItem(item: ItemSpec&lt;C&gt;): ValidationResult`

Validates an item specification.

#### `registerOperation?(name: string, impl: OperationImpl&lt;C&gt;, options?: { precedence?: number }): void`

Registers custom operations.

### Example

```typescript
import { defineConfig, createEngine } from "mod-engine";

const config = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: ["sum", "multiply"] as const,
  attributes: [] as const,
});

const engine = createEngine(config);

// Create items
const item = engine.builder("Magic Sword").increase("Damage").by(50).build();

// Evaluate items
const result = engine.evaluate(item);
console.log(result.metrics); // { Health: 0, Damage: 50 }
```

### Error Handling

Throws `ValidationError` when:

- Configuration is invalid
- Strict operations mode is enabled and operations lack implementations
- Internal validation fails

### Built-in Operations

The engine automatically registers these built-in operations:

- `sum` - Addition operation
- `subtract` - Subtraction operation
- `multiply` - Multiplication operation

### Custom Operations

Register custom operations after creating the engine:

```typescript
const engine = createEngine(config);

engine.registerOperation("pow", {
  impl: (current, value) => Math.pow(current, value),
  precedence: 100,
});
```

## Type Safety

Both functions provide complete TypeScript type safety:

```typescript
type Config = typeof config;
type Metrics = MetricOf<Config>; // "Health" | "Damage"
type Operations = OperationOf<Config>; // "sum" | "multiply"
```

The configuration determines all available types at compile time, ensuring type-safe development.

---

_Context added by Giga validation rules - using configuration schema validation and core validation components information._
