# API Reference Overview

This section provides comprehensive documentation for all Mod-Engine APIs, types, and functions.

## Core API

### Configuration

- [`defineConfig()`](./configuration.md#defineconfig) - Define system configuration
- [`createEngine()`](./configuration.md#createengine) - Create engine instance
- [`validateConfig()`](./configuration.md#validateconfig) - Validate configuration

### Engine

- [`engine.builder()`](./builder.md) - Create item builder
- [`engine.evaluate()`](./evaluation.md) - Evaluate item
- [`createConditionBuilder()`](./conditions.md) - Create condition builder

### Builder

- [`.set()`](./builder.md#set) - Set item attributes
- [`.increase()`](./builder.md#increase) - Add increase modifier
- [`.multiply()`](./builder.md#multiply) - Add multiply modifier
- [`.when()`](./builder.md#when) - Add condition
- [`.with()`](./builder.md#with) - Set modifier options
- [`.build()`](./builder.md#build) - Build item specification

## Type System

### Core Types

- [`ConfigSpec`](./types.md#configspec) - Configuration specification
- [`ItemSpec`](./types.md#itemspec) - Item specification
- [`EvaluationResult`](./types.md#evaluationresult) - Evaluation output

### Modifier Types

- [`Modifier`](./types.md#modifier) - Modifier specification
- [`Condition`](./types.md#condition) - Conditional logic
- [`Stacking`](./types.md#stacking) - Stacking behavior

### Attribute Types

- [`AttributeSchema`](./types.md#attributeschema) - Attribute definition
- [`EnumAttributeSchema`](./types.md#enumattributeschema) - Enum attribute
- [`NumberAttributeSchema`](./types.md#numberattributeschema) - Number attribute
- [`BooleanAttributeSchema`](./types.md#booleanattributeschema) - Boolean attribute

## Operations

### Built-in Operations

- [`sum`](./operations.md#sum) - Addition operation
- [`subtract`](./operations.md#subtract) - Subtraction operation
- [`multiply`](./operations.md#multiply) - Multiplication operation

### Custom Operations

- [`OperationImpl`](./operations.md#operationimpl) - Operation implementation type
- `engine.registerOperation()` - Register a custom operation implementation

## Validation

### Validation Functions

- [`validateItem()`](./validation.md#validateitem) - Validate item specification
- [`validateCondition()`](./validation.md#validatecondition) - Validate condition
- [`validateOperations()`](./validation.md#validateoperations) - Validate operations

### Error Types

- [`ValidationError`](./validation.md#validationerror) - Validation failure
- [`SchemaError`](./validation.md#schemaerror) - Schema validation error
- [`ConditionError`](./validation.md#conditionerror) - Condition validation error

## Serialization

### Serialization Functions

- [`serializeItem()`](./serialization.md#serializeitem) - Serialize item to JSON
- [`deserializeItem()`](./serialization.md#deserializeitem) - Deserialize item from JSON
- [`toSnapshot()`](./serialization.md#tosnapshot) - Create evaluation snapshot

## Quick Reference

### Common Patterns

#### Basic Configuration

```typescript
import { defineConfig, createEngine } from "mod-engine";

const config = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: ["sum", "multiply"] as const,
  attributes: [
    /* ... */
  ] as const,
});

const engine = createEngine(config);
```

#### Building Items

```typescript
const item = engine
  .builder("Item Name")
  .set("attribute", value)
  .increase("metric")
  .by(amount)
  .when(condition)
  .build();
```

#### Evaluation

```typescript
const result = engine.evaluate(item);
console.log(result.metrics);
console.log(result.appliedModifiers);
```

## Type Utilities

### Inference Types

- `MetricOf<TConfig>` - Extract metric types from config
- `AttrKeyOf<TConfig>` - Extract attribute keys from config
- `AttrValueOf<TConfig, TKey>` - Extract attribute value type
- `OperationOf<TConfig>` - Extract operation types from config

### Example Usage

```typescript
type Config = typeof myConfig;
type Metrics = MetricOf<Config>; // "Health" | "Damage"
type Operations = OperationOf<Config>; // "sum" | "multiply"
```

## Error Handling

All Mod-Engine functions throw typed errors that you can catch and handle:

```typescript
import { ValidationError, SchemaError } from "mod-engine";

try {
  const result = engine.evaluate(item);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation failed:", error.message);
  } else if (error instanceof SchemaError) {
    console.error("Schema error:", error.message);
  }
}
```

## Next Steps

- Browse detailed [API documentation](./configuration.md) for each function
- See [practical examples](../examples/nextjs-demo.md) of API usage
- Learn about [concepts](../concepts/overview.md) and patterns
