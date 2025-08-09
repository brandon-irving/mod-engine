# Evaluation API

The evaluation module provides functions for processing item specifications and calculating final metric values through modifier application.

## evaluateItem

The core evaluation function that processes an item and returns computed metrics.

### Signature

```typescript
function evaluateItem<C extends ConfigSpec>(
  item: ItemSpec<C>,
  operations: Map<string, OperationInfo<C>>,
  config: C,
  baseMetrics?: Partial<Record<MetricOf<C>, number>>
): EvaluationResult<C>;
```

### Parameters

- `item` - Item specification with attributes and modifiers
- `operations` - Map of available operations
- `config` - Configuration schema
- `baseMetrics` - Optional base metric values (defaults to 0)

### Returns

`EvaluationResult<C>` containing:

- `metrics` - Final computed metric values
- `applied` - Array of successfully applied modifiers with traces

### Example

```typescript
import { evaluateItem } from "mod-engine";

// Usually called through engine.evaluate()
const result = engine.evaluate(item, { base: { Health: 100, Damage: 10 } });

console.log(result.metrics);
// { Health: 250, Damage: 75 }

console.log(result.applied);
// [{ modifier: {...}, before: 10, after: 60, operation: "sum" }, ...]
```

## createMetricsSnapshot

Creates a snapshot of computed metrics for serialization.

### Signature

```typescript
function createMetricsSnapshot<C extends ConfigSpec>(
  metrics: Record<MetricOf<C>, number>
): Record<MetricOf<C>, number>;
```

### Parameters

- `metrics` - Final computed metrics from evaluation

### Returns

Immutable snapshot of metric values.

## validateMetricsCompleteness

Validates that all required metrics have valid values.

### Signature

```typescript
function validateMetricsCompleteness<C extends ConfigSpec>(
  metrics: Record<MetricOf<C>, number>,
  config: C
): void;
```

### Parameters

- `metrics` - Computed metric values
- `config` - Configuration schema

### Throws

`EvaluationError` if metrics are incomplete or contain invalid values.

## Evaluation Process

The evaluation follows a specific pipeline:

### 1. Initialization

```typescript
// Initialize all metrics to base values or 0
const metrics = {} as Record<MetricOf<C>, number>;
for (const metric of config.metrics) {
  metrics[metric] = baseMetrics?.[metric] ?? 0;
}
```

### 2. Condition Filtering

```typescript
// Filter modifiers by their conditions
const validModifiers = item.modifiers.filter((modifier) => {
  if (!modifier.conditions) return true;
  return evaluateCondition(modifier.conditions, item.attributes);
});
```

### 3. Stacking Rules

Apply stacking rules to prevent duplicate effects:

- **Default stacking** - All modifiers apply
- **Unique stacking** - Only one modifier per source applies

### 4. Priority Sorting

Sort modifiers by:

1. **Modifier priority** (higher = applied later)
2. **Operation precedence** (defined in operation registration)

### 5. Application

Apply each modifier in order:

```typescript
for (const modifier of sortedModifiers) {
  const before = metrics[modifier.metric];
  const operation = operations.get(modifier.operation)!;
  const after = operation.impl(before, modifier.value, context);
  metrics[modifier.metric] = after;

  // Track application
  applied.push({ modifier, before, after, operation: modifier.operation });
}
```

## EvaluationResult Structure

### metrics

Final computed values for all metrics:

```typescript
{
  Health: 250,
  Damage: 75,
  Defense: 45,
  Speed: 12
}
```

### applied

Array of modifier applications with traces:

```typescript
[
  {
    modifier: {
      metric: "Health",
      operation: "sum",
      value: 50,
      conditions: { op: "eq", attr: "Enchanted", value: true },
    },
    appliedValue: 50,
    before: 100,
    after: 150,
    resultingValue: 150,
  },
  // ... more applications
];
```

## Error Handling

### EvaluationError

Thrown when evaluation fails:

- Invalid operation implementations
- Numeric overflow/underflow
- Condition evaluation failures
- Missing required operations

```typescript
try {
  const result = engine.evaluate(item);
} catch (error) {
  if (error instanceof EvaluationError) {
    console.error("Evaluation failed:", error.message);
  }
}
```

## Advanced Usage

### Custom Base Metrics

```typescript
const baseStats = {
  Health: 100,
  Damage: 25,
  Defense: 15,
};

const result = engine.evaluate(item, { base: baseStats });
```

### Conditional Evaluation

```typescript
const item = engine
  .builder("Conditional Item")
  .set("Level", 50)
  .set("Class", "Warrior")
  // Only applies to high-level warriors
  .when({
    op: "and",
    conditions: [
      { op: "gte", attr: "Level", value: 40 },
      { op: "eq", attr: "Class", value: "Warrior" },
    ],
  })
  .multiply("Health")
  .by(1.5)
  .build();

const result = engine.evaluate(item);
// Health multiplier only applies if conditions are met
```

### Priority-Based Ordering

```typescript
const item = engine
  .builder("Ordered Item")
  // Applied first (highest priority)
  .with({ priority: 100 })
  .increase("Damage")
  .by(50)
  // Applied last (lowest priority)
  .with({ priority: 10 })
  .multiply("Damage")
  .by(1.5)
  .build();

// Evaluation: (0 + 50) * 1.5 = 75
```

### Unique Stacking

```typescript
const item = engine
  .builder("Stacked Item")
  // Only one fire enchantment can apply
  .with({ stacking: "unique", source: "fire-enchant" })
  .increase("Damage")
  .by(25)
  .with({ stacking: "unique", source: "fire-enchant" })
  .increase("Damage")
  .by(30) // This won't apply
  .build();

// Only the first fire enchantment applies
```

## Performance Considerations

### Efficient Evaluation

- Condition filtering happens before sorting for performance
- Operations are cached and reused
- Stacking rules are applied during filtering

### Memory Usage

- Evaluation results are immutable
- Modifier applications track only essential information
- Large item collections should be evaluated incrementally

### Debugging Support

The evaluation trace provides complete visibility:

```typescript
const result = engine.evaluate(item);

// See which modifiers were applied
console.log(`Applied ${result.applied.length} modifiers`);

// Debug specific applications
result.applied.forEach((app) => {
  console.log(
    `${app.modifier.metric}: ${app.before} → ${app.after} (${app.operation})`
  );
});
```

_Context added by Giga data-models, evaluation-algorithms, and metric-operations - using evaluation result structures, metric evaluation process information, and core operation types._
