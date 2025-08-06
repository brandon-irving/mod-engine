# Types API

This reference covers all TypeScript types and interfaces provided by mod-engine for building type-safe modification systems.

## Core Configuration Types

### ConfigSpec

The fundamental configuration interface that defines the entire system.

```typescript
interface ConfigSpec {
  readonly metrics: readonly string[];
  readonly operations: readonly string[];
  readonly attributes: readonly AttributeSchema[];
}
```

#### Example

```typescript
const config: ConfigSpec = {
  metrics: ["Health", "Damage", "Defense"] as const,
  operations: ["sum", "multiply", "subtract"] as const,
  attributes: [
    { key: "Rarity", kind: "enum", values: ["Common", "Epic"] as const },
  ] as const,
};
```

## Attribute Schema Types

### AttributeSchema

Base interface for all attribute definitions.

```typescript
interface AttributeSchema {
  readonly key: string;
  readonly kind: "enum" | "number" | "boolean" | "string";
}
```

### EnumAttributeSchema

Defines attributes with a fixed set of values.

```typescript
interface EnumAttributeSchema {
  readonly key: string;
  readonly kind: "enum";
  readonly values: readonly string[];
  readonly cardinality?: "single" | "multi";
}
```

#### Example

```typescript
{
  key: "Rarity",
  kind: "enum",
  values: ["Common", "Rare", "Epic", "Legendary"] as const,
  cardinality: "single" // default
}

{
  key: "Tags",
  kind: "enum",
  values: ["Weapon", "Armor", "Accessory"] as const,
  cardinality: "multi" // allows multiple values
}
```

### NumberAttributeSchema

Defines numeric attributes with optional constraints.

```typescript
interface NumberAttributeSchema {
  readonly key: string;
  readonly kind: "number";
  readonly min?: number;
  readonly max?: number;
  readonly integer?: boolean;
}
```

#### Example

```typescript
{
  key: "Level",
  kind: "number",
  min: 1,
  max: 100,
  integer: true
}

{
  key: "CritChance",
  kind: "number",
  min: 0,
  max: 100
}
```

### BooleanAttributeSchema

Defines true/false attributes.

```typescript
interface BooleanAttributeSchema {
  readonly key: string;
  readonly kind: "boolean";
}
```

#### Example

```typescript
{
  key: "Enchanted",
  kind: "boolean"
}
```

### StringAttributeSchema

Defines text attributes with optional validation.

```typescript
interface StringAttributeSchema {
  readonly key: string;
  readonly kind: "string";
  readonly minLen?: number;
  readonly maxLen?: number;
  readonly pattern?: string;
}
```

#### Example

```typescript
{
  key: "ItemName",
  kind: "string",
  minLen: 1,
  maxLen: 50,
  pattern: "^[A-Za-z0-9 ]+$"
}
```

## Item Types

### ItemSpec

Complete item specification with attributes and modifiers.

```typescript
interface ItemSpec<C extends ConfigSpec> {
  readonly name?: string;
  readonly attributes: Attributes<C>;
  readonly modifiers: readonly Modifier<C>[];
}
```

### Attributes

Type-safe attributes object based on configuration.

```typescript
type Attributes<C extends ConfigSpec> = {
  [K in AttrKeyOf<C>]?: AttrValueOf<C, K>;
};
```

### Modifier

Individual modifier specification.

```typescript
interface Modifier<C extends ConfigSpec> {
  readonly metric: MetricOf<C>;
  readonly operation: OperationOf<C>;
  readonly value: number;
  readonly conditions?: Condition<C>;
  readonly stacking?: Stacking;
  readonly priority?: number;
  readonly source?: string;
}
```

## Evaluation Types

### EvaluationResult

Result of item evaluation with metrics and application trace.

```typescript
interface EvaluationResult<C extends ConfigSpec> {
  readonly metrics: Record<MetricOf<C>, number>;
  readonly applied: readonly ModifierApplication<C>[];
}
```

### ModifierApplication

Record of a modifier application with before/after values.

```typescript
interface ModifierApplication<C extends ConfigSpec> {
  readonly modifier: Modifier<C>;
  readonly before: number;
  readonly after: number;
  readonly operation: OperationOf<C>;
}
```

### EvalContext

Context passed to operation implementations.

```typescript
interface EvalContext<C extends ConfigSpec> {
  readonly attributes: Attributes<C>;
  readonly item: ItemSpec<C>;
}
```

## Condition Types

### Condition

Conditional logic for modifier application.

```typescript
type Condition<C extends ConfigSpec> = SimpleCondition<C> | LogicalCondition<C>;
```

### SimpleCondition

Basic attribute comparison conditions.

```typescript
type SimpleCondition<C extends ConfigSpec> =
  | { op: "eq"; attr: AttrKeyOf<C>; value: AttrValueOf<C, attr> }
  | { op: "gt" | "gte" | "lt" | "lte"; attr: AttrKeyOf<C>; value: number }
  | { op: "includes"; attr: AttrKeyOf<C>; value: AttrValueOf<C, attr>[] }
  | { op: "contains"; attr: AttrKeyOf<C>; value: AttrValueOf<C, attr> };
```

### LogicalCondition

Logical operators for combining conditions.

```typescript
type LogicalCondition<C extends ConfigSpec> =
  | { op: "and"; conditions: Condition<C>[] }
  | { op: "or"; conditions: Condition<C>[] }
  | { op: "not"; condition: Condition<C> };
```

## Operation Types

### OperationImpl

Function signature for operation implementations.

```typescript
type OperationImpl<C extends ConfigSpec> = (
  currentValue: number,
  modifierValue: number,
  context: EvalContext<C>
) => number;
```

### OperationInfo

Operation with metadata.

```typescript
interface OperationInfo<C extends ConfigSpec> {
  readonly impl: OperationImpl<C>;
  readonly precedence: number;
}
```

### BuiltinOperation

Union of built-in operation names.

```typescript
type BuiltinOperation = "sum" | "subtract" | "multiply";
```

## Utility Types

### MetricOf

Extracts metric names from configuration.

```typescript
type MetricOf<C extends ConfigSpec> = C["metrics"][number];
```

#### Example

```typescript
type Config = typeof myConfig;
type Metrics = MetricOf<Config>; // "Health" | "Damage" | "Defense"
```

### OperationOf

Extracts operation names from configuration.

```typescript
type OperationOf<C extends ConfigSpec> = C["operations"][number];
```

#### Example

```typescript
type Operations = OperationOf<Config>; // "sum" | "multiply" | "pow"
```

### AttrKeyOf

Extracts attribute keys from configuration.

```typescript
type AttrKeyOf<C extends ConfigSpec> = C["attributes"][number]["key"];
```

#### Example

```typescript
type AttributeKeys = AttrKeyOf<Config>; // "Rarity" | "Level" | "Enchanted"
```

### AttrValueOf

Extracts attribute value type for a specific key.

```typescript
type AttrValueOf<C extends ConfigSpec, K extends AttrKeyOf<C>> =
  // Complex conditional type that returns the correct value type
```

#### Example

```typescript
type RarityValue = AttrValueOf<Config, "Rarity">; // "Common" | "Rare" | "Epic"
type LevelValue = AttrValueOf<Config, "Level">; // number
type EnchantedValue = AttrValueOf<Config, "Enchanted">; // boolean
```

## Validation Types

### ValidationResult

Result of validation operations.

```typescript
interface ValidationResult {
  readonly ok: boolean;
  readonly errors: ValidationError[];
}
```

### ValidationError

Detailed validation error information.

```typescript
interface ValidationError {
  readonly message: string;
  readonly path?: string;
  readonly code?: string;
}
```

## Stacking Types

### Stacking

Modifier stacking behavior.

```typescript
type Stacking = "default" | "unique";
```

- `"default"` - All modifiers apply normally
- `"unique"` - Only one modifier per source applies

## Serialization Types

### SerializedData

Generic serialized data container.

```typescript
interface SerializedData<T> {
  readonly data: T;
  readonly version: string;
  readonly timestamp: number;
}
```

## Engine Types

### Engine

Main engine interface with core functionality.

```typescript
interface Engine<C extends ConfigSpec> {
  builder(name?: string): Builder<C>;
  evaluate(
    item: ItemSpec<C>,
    options?: { base?: Partial<Record<MetricOf<C>, number>> }
  ): EvaluationResult<C>;
  validateItem(item: ItemSpec<C>): ValidationResult;
  registerOperation?(
    name: string,
    impl: OperationImpl<C>,
    options?: { precedence?: number }
  ): void;
}
```

## Type Guards and Helpers

### Type-Safe Attribute Access

```typescript
function getAttributeValue<C extends ConfigSpec, K extends AttrKeyOf<C>>(
  attributes: Attributes<C>,
  key: K
): AttrValueOf<C, K> | undefined {
  return attributes[key];
}
```

### Builder Helpers

```typescript
function applyAttributes<C extends ConfigSpec>(
  builder: Builder<C>,
  attributes: Partial<Attributes<C>>
): Builder<C> {
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined) {
      builder.set(key as AttrKeyOf<C>, value);
    }
  });
  return builder;
}
```

### Type Inference Examples

```typescript
// Configuration inference
const config = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: ["sum", "multiply"] as const,
  attributes: [
    { key: "Rarity", kind: "enum", values: ["Common", "Epic"] as const },
  ] as const,
});

type Config = typeof config;
type Metrics = MetricOf<Config>; // "Health" | "Damage"
type Operations = OperationOf<Config>; // "sum" | "multiply"
type RarityValues = AttrValueOf<Config, "Rarity">; // "Common" | "Epic"

// Engine inference
const engine = createEngine(config);
type Engine = typeof engine; // Engine<Config>

// Builder inference
const builder = engine.builder("Test");
type Builder = typeof builder; // Builder<Config>
```

This type system ensures complete compile-time safety while maintaining flexibility for complex item modification systems.

_Context added by Giga data-models - using core data model implementations, item specification model, and metric modifier model information._
