# Operations API

The operations module provides built-in operations and utilities for creating custom operations that modify item metrics.

## Built-in Operations

### sumOperation

Adds a value to the current metric.

```typescript
function sumOperation<C extends ConfigSpec>(
  current: number,
  value: number,
  context: EvalContext<C>
): number;
```

**Formula:** `current + value`

### subtractOperation

Subtracts a value from the current metric.

```typescript
function subtractOperation<C extends ConfigSpec>(
  current: number,
  value: number,
  context: EvalContext<C>
): number;
```

**Formula:** `current - value`

### multiplyOperation

Multiplies the current metric by a value.

```typescript
function multiplyOperation<C extends ConfigSpec>(
  current: number,
  value: number,
  context: EvalContext<C>
): number;
```

**Formula:** `current * value`

## Operation Utilities

### builtinOps

Type-safe helper for declaring built-in operations in configuration.

```typescript
function builtinOps<T extends BuiltinOperation>(...ops: T[]): readonly T[];
```

#### Example

```typescript
import { defineConfig, builtinOps } from "mod-engine";

const config = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: builtinOps("sum", "multiply"), // Type-safe
  attributes: [] as const,
});
```

### createBuiltInOperations

Creates a map of built-in operations along with precedence values.

```typescript
function createBuiltInOperations<C extends ConfigSpec>(): Map<
  string,
  OperationInfo<C>
>;
```

### validateNumericResult

Validates that an operation result is a valid number.

```typescript
function validateNumericResult(value: number, operationName: string): number;
```

#### Throws

`OperationError` if the value is `NaN` or `Infinity`.

## Custom Operations

### OperationImpl Type

Interface for implementing custom operations.

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
- `context` - Evaluation context with attributes and item

### Example Custom Operations

#### Power Operation

```typescript
const powOperation: OperationImpl<Config> = (current, value) => {
  return Math.pow(current, value);
};

engine.registerOperation("pow", powOperation);
```

#### Clamp Operation

```typescript
const clampOperation: OperationImpl<Config> = (current, value) => {
  return Math.min(Math.max(current, 0), value);
};

engine.registerOperation("clamp", clampOperation);
```

#### Context-Aware Operation

```typescript
const levelScaledAdd: OperationImpl<Config> = (current, value, context) => {
  const level = context.attributes.Level ?? 1;
  const scaledValue = value * (1 + level / 100);
  return current + scaledValue;
};

engine.registerOperation("levelAdd", levelScaledAdd);
```

## OperationInfo Structure

Operations are stored with metadata:

```typescript
interface OperationInfo<C extends ConfigSpec> {
  impl: OperationImpl<C>;
  precedence: number;
}
```

### Precedence System

Operations with higher precedence are applied later:

```typescript
// Applied in order: sum (0), multiply (0), pow (100)
engine.registerOperation("pow", powOp, { precedence: 100 });
```

Default precedence for built-ins:

- `sum`: 10
- `subtract`: 10
- `multiply`: 20

## Registration Methods

### Engine Registration

```typescript
engine.registerOperation("customOp", impl, { precedence: 50 });
```

### Engine Builder Registration

```typescript
const engine = createEngineBuilder(config)
  .withOperation("pow", powOperation)
  .withOperations({
    min: { impl: minOperation, precedence: 10 },
    max: { impl: maxOperation, precedence: 10 },
  })
  .build();
```

## Advanced Patterns

### Mathematical Operations

```typescript
const mathOperations = {
  pow: (current, value) => Math.pow(current, value),
  sqrt: (current, value) => Math.sqrt(current + value),
  log: (current, value) => Math.log(Math.max(current + value, 1)),
  abs: (current, value) => Math.abs(current + value),
  round: (current, value) => Math.round(current + value),
};

// Register all at once
Object.entries(mathOperations).forEach(([name, impl]) => {
  engine.registerOperation(name, impl);
});
```

### Conditional Operations

```typescript
const conditionalBonus: OperationImpl<Config> = (current, value, context) => {
  const isEnchanted = context.attributes.Enchanted;
  const isRare = ["Rare", "Epic", "Legendary"].includes(
    context.attributes.Rarity
  );

  let bonus = value;
  if (isEnchanted) bonus *= 1.5;
  if (isRare) bonus *= 1.2;

  return current + bonus;
};
```

### Bounded Operations

```typescript
const boundedAdd: OperationImpl<Config> = (current, value, context) => {
  const maxValue = context.attributes.MaxHealth ?? 1000;
  return Math.min(current + value, maxValue);
};

const boundedMultiply: OperationImpl<Config> = (current, value, context) => {
  const result = current * value;
  const cap = context.attributes.CapMultiplier ?? 10;
  return Math.min(result, current * cap);
};
```

### Percentage Operations

```typescript
const percentageIncrease: OperationImpl<Config> = (current, percentage) => {
  return current * (1 + percentage / 100);
};

const percentageDecrease: OperationImpl<Config> = (current, percentage) => {
  return current * (1 - percentage / 100);
};
```

## Error Handling

### OperationError

Thrown when operations produce invalid results:

```typescript
import { OperationError } from "mod-engine";

const safeOperation: OperationImpl<Config> = (current, value) => {
  const result = current / value;

  if (!isFinite(result)) {
    throw new OperationError(`Division by ${value} produced invalid result`);
  }

  return result;
};
```

### Validation

```typescript
const validatedOperation: OperationImpl<Config> = (current, value) => {
  if (value < 0) {
    throw new OperationError("Negative values not allowed");
  }

  const result = current + value;
  return validateNumericResult(result, "customAdd");
};
```

## Type Safety

Operations are fully type-safe:

```typescript
// ✅ Valid - operation in config
engine.registerOperation("declaredOp", impl);

// ❌ TypeScript error - operation not declared
engine.registerOperation("undeclaredOp", impl);

// ✅ Type-safe context access
const contextOp: OperationImpl<Config> = (current, value, context) => {
  // context.attributes is fully typed
  const level: number = context.attributes.Level;
  return current + value * level;
};
```

## Performance Tips

### Efficient Operations

```typescript
// ✅ Fast - simple arithmetic
const fastOp = (current, value) => current * value;

// ❌ Slow - complex calculations
const slowOp = (current, value, context) => {
  return Math.pow(Math.sin(current), Math.cos(value));
};
```

### Caching Context Values

```typescript
const cachedOp: OperationImpl<Config> = (current, value, context) => {
  // Cache expensive lookups
  const multiplier =
    context.cache?.multiplier ??
    (context.cache = { multiplier: calculateMultiplier(context) }).multiplier;

  return current + value * multiplier;
};
```

_Context added by Giga metric-operations - using core operation types, operation registration, and stacking behavior information._
