# Engine Builder API

The Engine Builder provides a type-safe way to create engines with custom operations, ensuring all declared operations are properly registered before the engine is built.

## createEngineBuilder

Creates a new engine builder instance.

### Signature

```typescript
function createEngineBuilder<const C extends ConfigSpec>(
  config: C
): EngineBuilder<C>;
```

### Parameters

- `config` - Configuration object from `defineConfig()`

### Returns

An `EngineBuilder<C>` instance for registering operations and building engines.

### Example

```typescript
import { defineConfig, createEngineBuilder } from "mod-engine";

const config = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: ["sum", "multiply", "pow", "clamp"] as const,
  attributes: [] as const,
});

const engineBuilder = createEngineBuilder(config);
```

## Class: EngineBuilder&lt;C&gt;

Type-safe engine builder that enforces operation registration.

### withOperation()

Registers a single custom operation.

```typescript
withOperation<OpName extends OperationOf<C>>(
  name: OpName extends "sum" | "subtract" | "multiply" ? never : OpName,
  impl: OperationImpl<C>,
  options?: { precedence?: number }
): EngineBuilder<C>
```

#### Parameters

- `name` - Operation name (must be in config, cannot be built-in)
- `impl` - Operation implementation function
- `options` - Optional settings:
  - `precedence` - Application priority (default: 0)

#### Example

```typescript
const engine = createEngineBuilder(config)
  .withOperation("pow", (current, value) => Math.pow(current, value))
  .withOperation(
    "clamp",
    (current, value, context) => {
      const max = context.attributes.MaxValue ?? 100;
      return Math.min(current + value, max);
    },
    { precedence: 50 }
  )
  .build();
```

### withOperations()

Registers multiple custom operations at once.

```typescript
withOperations(
  operations: Record<
    Exclude<OperationOf<C>, "sum" | "subtract" | "multiply">,
    { impl: OperationImpl<C>; precedence?: number }
  >
): EngineBuilder<C>
```

#### Parameters

- `operations` - Object mapping operation names to implementations

#### Example

```typescript
const engine = createEngineBuilder(config)
  .withOperations({
    pow: {
      impl: (current, value) => Math.pow(current, value),
      precedence: 100,
    },
    clamp: {
      impl: (current, value, context) => {
        const max = context.attributes.MaxValue ?? 1000;
        return Math.min(current + value, max);
      },
      precedence: 10,
    },
    min: {
      impl: (current, value) => Math.min(current, value),
    },
    max: {
      impl: (current, value) => Math.max(current, value),
    },
  })
  .build();
```

### build()

Creates the final engine, validating that all operations are registered.

```typescript
build(): Engine<C>
```

#### Returns

A fully configured `Engine<C>` instance with all operations registered.

#### Throws

`Error` if any declared operations are missing implementations.

#### Example

```typescript
const config = defineConfig({
  metrics: ["Health"] as const,
  operations: ["sum", "pow", "clamp"] as const,
  attributes: [] as const,
});

// ❌ This will throw - missing pow and clamp operations
const engineBuilder = createEngineBuilder(config);
const engine = engineBuilder.build(); // Error!

// ✅ This will succeed - all operations registered
const engine = createEngineBuilder(config)
  .withOperation("pow", (current, value) => Math.pow(current, value))
  .withOperation("clamp", (current, value) =>
    Math.min(Math.max(current, 0), value)
  )
  .build();
```

## Operation Implementation

### OperationImpl Type

```typescript
type OperationImpl<C extends ConfigSpec> = (
  currentValue: number,
  modifierValue: number,
  context: EvalContext<C>
) => number;
```

#### Parameters

- `currentValue` - Current metric value
- `modifierValue` - Value from the modifier
- `context` - Evaluation context containing:
  - `attributes` - Item attributes
  - `item` - Complete item specification

#### Example Implementations

```typescript
// Simple power operation
const powOperation: OperationImpl<Config> = (current, value) => {
  return Math.pow(current, value);
};

// Context-aware scaling operation
const scaleOperation: OperationImpl<Config> = (current, value, context) => {
  const level = context.attributes.Level ?? 1;
  const scaleFactor = 1 + level / 100;
  return current + value * scaleFactor;
};

// Bounded operation with validation
const boundedAdd: OperationImpl<Config> = (current, value, context) => {
  const maxValue = context.attributes.MaxHealth ?? 1000;
  const result = current + value;
  return Math.min(result, maxValue);
};
```

## Built-in Operations

The following operations are always available and don't need registration:

- `sum` - Addition: `current + value`
- `subtract` - Subtraction: `current - value`
- `multiply` - Multiplication: `current * value`

## Precedence System

Operations with higher precedence are applied later in the evaluation:

```typescript
const engine = createEngineBuilder(config)
  .withOperation("addBonus", (c, v) => c + v, { precedence: 10 })
  .withOperation("multiply", (c, v) => c * v, { precedence: 20 })
  .build();

// Evaluation order: addBonus first (10), then multiply (20)
```

## Error Handling

### Missing Operations

```typescript
const config = defineConfig({
  operations: ["sum", "customOp"] as const,
  // ... rest of config
});

// ❌ Throws: Custom operations "customOp" must be registered
const engine = createEngineBuilder(config).build();
```

### Invalid Registration

```typescript
// ❌ TypeScript error - cannot override built-in operations
.withOperation("sum", (c, v) => c + v) // Compile error

// ❌ TypeScript error - operation not in config
.withOperation("notInConfig", (c, v) => c + v) // Compile error
```

## Advanced Usage

### Conditional Operations

```typescript
const conditionalOp: OperationImpl<Config> = (current, value, context) => {
  const isEnchanted = context.attributes.Enchanted;
  const multiplier = isEnchanted ? 2 : 1;
  return current + value * multiplier;
};

const engine = createEngineBuilder(config)
  .withOperation("enchantedBonus", conditionalOp)
  .build();
```

### Mathematical Operations

```typescript
const mathOps = {
  pow: {
    impl: (c, v) => Math.pow(c, v),
    precedence: 100,
  },
  sqrt: {
    impl: (c, v) => Math.sqrt(c + v),
    precedence: 90,
  },
  log: {
    impl: (c, v) => Math.log(c + v),
    precedence: 80,
  },
  clamp: {
    impl: (c, v) => Math.min(Math.max(c, 0), v),
    precedence: 10,
  },
};

const engine = createEngineBuilder(config).withOperations(mathOps).build();
```

## Type Safety

The Engine Builder enforces type safety at compile time:

```typescript
// ✅ Valid - operation in config
.withOperation("customOp", (c, v) => c + v)

// ❌ TypeScript error - built-in operation
.withOperation("sum", (c, v) => c + v)

// ❌ TypeScript error - not in operations array
.withOperation("notDeclared", (c, v) => c + v)
```

This ensures that all operations used in the configuration are properly implemented before the engine is created.
