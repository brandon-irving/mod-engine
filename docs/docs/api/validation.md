# Validation API

The validation module provides comprehensive validation functions for configurations, items, and operations with detailed error reporting.

## Core Validation Functions

### validateConfig

Validates a complete configuration specification.

```typescript
function validateConfig<C extends ConfigSpec>(config: C): void;
```

#### Parameters

- `config` - Configuration object to validate

#### Throws

`ValidationError` if the configuration is invalid.

#### Validation Checks

- Metrics array is non-empty
- Operations array is non-empty
- Attributes array contains valid schemas
- No duplicate metric names
- No duplicate attribute keys
- Each attribute schema is well-formed

#### Example

```typescript
import { validateConfig, ValidationError } from "mod-engine";

try {
  validateConfig({
    metrics: ["Health", "Damage"] as const,
    operations: ["sum", "multiply"] as const,
    attributes: [
      { key: "Rarity", kind: "enum", values: ["Common", "Epic"] as const },
    ] as const,
  });
  console.log("Configuration is valid");
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Configuration error:", error.message);
  }
}
```

### validateItem

Validates an item specification against a configuration.

```typescript
function validateItem<C extends ConfigSpec>(
  item: ItemSpec<C>,
  config: C
): ValidationResult;
```

#### Parameters

- `item` - Item specification to validate
- `config` - Configuration schema

#### Returns

`ValidationResult` with validation status and error details.

#### Validation Checks

- All attribute keys exist in configuration
- Attribute values match schema constraints
- All modifier metrics exist in configuration
- All modifier operations exist in configuration
- Modifier values are valid numbers
- Conditions reference valid attributes

#### Example

```typescript
const result = engine.validateItem(item);

if (!result.ok) {
  console.log("Validation errors:");
  result.errors.forEach((error) => {
    console.log(`- ${error.message}`);
    if (error.path) {
      console.log(`  at: ${error.path}`);
    }
  });
}
```

### validateOperations

Validates that all declared operations have implementations.

```typescript
function validateOperations<C extends ConfigSpec>(
  config: C,
  operations: Map<string, OperationInfo<C>>
): void;
```

#### Parameters

- `config` - Configuration with declared operations
- `operations` - Map of registered operation implementations

#### Throws

`ValidationError` if any operations are missing implementations.

#### Example

```typescript
const operations = createBuiltInOperations<Config>();
operations.set("pow", { impl: powOperation, precedence: 100 });

try {
  validateOperations(config, operations);
  console.log("All operations are registered");
} catch (error) {
  console.error("Missing operations:", error.message);
}
```

## Attribute Validation

### Enum Attribute Validation

Validates enum attributes against their schema.

```typescript
// Single-value enum
{
  key: "Rarity",
  kind: "enum",
  values: ["Common", "Rare", "Epic"] as const,
  cardinality: "single" // default
}

// Multi-value enum
{
  key: "Tags",
  kind: "enum",
  values: ["Weapon", "Armor", "Accessory"] as const,
  cardinality: "multi"
}
```

#### Validation Rules

- Value must be in the allowed values array
- Single cardinality: exactly one value
- Multi cardinality: array of valid values

#### Example Errors

```typescript
// ❌ Invalid value
.set("Rarity", "Invalid") // Not in enum values

// ❌ Wrong cardinality
.set("Rarity", ["Epic", "Rare"]) // Single enum expects one value

// ✅ Valid
.set("Rarity", "Epic")
.set("Tags", ["Weapon", "Accessory"])
```

### Number Attribute Validation

Validates numeric attributes against constraints.

```typescript
{
  key: "Level",
  kind: "number",
  min: 1,
  max: 100,
  integer: true
}
```

#### Validation Rules

- Must be a finite number (not NaN or Infinity)
- Must be within min/max bounds
- Must be integer if specified

#### Example Errors

```typescript
// ❌ Out of bounds
.set("Level", 150) // Exceeds max of 100

// ❌ Not an integer
.set("Level", 25.5) // Integer required

// ❌ Invalid number
.set("Level", NaN) // Not a valid number

// ✅ Valid
.set("Level", 50)
```

### Boolean Attribute Validation

Validates boolean attributes.

```typescript
{
  key: "Enchanted",
  kind: "boolean"
}
```

#### Validation Rules

- Must be exactly `true` or `false`

#### Example Errors

```typescript
// ❌ Wrong type
.set("Enchanted", "true") // String, not boolean

// ❌ Truthy but not boolean
.set("Enchanted", 1) // Number, not boolean

// ✅ Valid
.set("Enchanted", true)
.set("Enchanted", false)
```

### String Attribute Validation

Validates string attributes against constraints.

```typescript
{
  key: "ItemName",
  kind: "string",
  minLen: 1,
  maxLen: 50,
  pattern: "^[A-Za-z0-9 ]+$"
}
```

#### Validation Rules

- Must be a string
- Length within min/max bounds
- Must match regex pattern if specified

#### Example Errors

```typescript
// ❌ Too short
.set("ItemName", "") // Below minLen of 1

// ❌ Too long
.set("ItemName", "A".repeat(100)) // Exceeds maxLen of 50

// ❌ Invalid pattern
.set("ItemName", "Sword!@#") // Contains invalid characters

// ✅ Valid
.set("ItemName", "Magic Sword")
```

## Modifier Validation

### Metric Validation

```typescript
// ❌ Invalid metric
.increase("InvalidMetric") // Not in config.metrics

// ❌ Wrong type
.increase(123) // Not a string

// ✅ Valid
.increase("Health")
.increase("Damage")
```

### Operation Validation

```typescript
// ❌ Invalid operation
.apply("Damage", "invalidOp") // Not in config.operations

// ❌ Unregistered operation
.apply("Damage", "pow") // Declared but not registered

// ✅ Valid
.increase("Damage") // Built-in sum operation
.apply("Damage", "pow") // Registered custom operation
```

### Value Validation

```typescript
// ❌ Invalid numbers
.by(NaN) // Not a finite number
.by(Infinity) // Not finite
.by("50") // Wrong type

// ✅ Valid
.by(50)
.by(-25)
.by(1.5)
```

## Condition Validation

### Attribute Reference Validation

```typescript
// ❌ Invalid attribute
.when({ op: "eq", attr: "InvalidAttr", value: "Epic" })

// ❌ Type mismatch
.when({ op: "gt", attr: "Rarity", value: 50 }) // String attr, number value

// ✅ Valid
.when({ op: "eq", attr: "Rarity", value: "Epic" })
.when({ op: "gte", attr: "Level", value: 50 })
```

### Logical Condition Validation

```typescript
// ❌ Empty conditions array
.when({ op: "and", conditions: [] })

// ❌ Invalid nested condition
.when({
  op: "and",
  conditions: [
    { op: "eq", attr: "InvalidAttr", value: "test" }
  ]
})

// ✅ Valid
.when({
  op: "and",
  conditions: [
    { op: "eq", attr: "Enchanted", value: true },
    { op: "gte", attr: "Level", value: 25 }
  ]
})
```

## ValidationResult Structure

### Success Result

```typescript
{
  ok: true,
  errors: []
}
```

### Failure Result

```typescript
{
  ok: false,
  errors: [
    {
      message: "Attribute 'InvalidAttr' does not exist in configuration",
      path: "attributes.InvalidAttr",
      code: "UNKNOWN_ATTRIBUTE"
    },
    {
      message: "Value 150 exceeds maximum of 100 for attribute 'Level'",
      path: "attributes.Level",
      code: "VALUE_OUT_OF_RANGE"
    }
  ]
}
```

## Error Codes

### Configuration Errors

- `EMPTY_METRICS` - Metrics array is empty
- `EMPTY_OPERATIONS` - Operations array is empty
- `DUPLICATE_METRIC` - Duplicate metric names
- `DUPLICATE_ATTRIBUTE` - Duplicate attribute keys
- `INVALID_ATTRIBUTE_SCHEMA` - Malformed attribute schema

### Attribute Errors

- `UNKNOWN_ATTRIBUTE` - Attribute not in configuration
- `TYPE_MISMATCH` - Value type doesn't match schema
- `VALUE_OUT_OF_RANGE` - Numeric value outside min/max bounds
- `INVALID_ENUM_VALUE` - Value not in enum values array
- `STRING_TOO_SHORT` - String below minimum length
- `STRING_TOO_LONG` - String exceeds maximum length
- `PATTERN_MISMATCH` - String doesn't match regex pattern
- `INVALID_CARDINALITY` - Wrong number of values for enum

### Modifier Errors

- `UNKNOWN_METRIC` - Metric not in configuration
- `UNKNOWN_OPERATION` - Operation not in configuration
- `INVALID_MODIFIER_VALUE` - Non-finite modifier value
- `MISSING_OPERATION_IMPL` - Operation declared but not registered

### Condition Errors

- `INVALID_CONDITION_STRUCTURE` - Malformed condition object
- `UNKNOWN_CONDITION_ATTRIBUTE` - Condition references invalid attribute
- `CONDITION_TYPE_MISMATCH` - Condition value type mismatch

## Advanced Validation

### Custom Validation Rules

```typescript
function validateCustomRules<C extends ConfigSpec>(
  item: ItemSpec<C>,
  config: C
): ValidationResult {
  const errors: ValidationError[] = [];

  // Custom rule: Legendary items must be enchanted
  const rarity = item.attributes.Rarity;
  const enchanted = item.attributes.Enchanted;

  if (rarity === "Legendary" && !enchanted) {
    errors.push({
      message: "Legendary items must be enchanted",
      path: "attributes.Enchanted",
      code: "LEGENDARY_NOT_ENCHANTED",
    });
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
```

### Validation Helpers

```typescript
function validateAttributeDefaults<C extends ConfigSpec>(
  attributes: Partial<Attributes<C>>,
  config: C
): ValidationResult {
  const errors: ValidationError[] = [];

  Object.entries(attributes).forEach(([key, value]) => {
    const attrSchema = config.attributes.find((attr) => attr.key === key);

    if (!attrSchema) {
      errors.push({
        message: `Unknown attribute: ${key}`,
        path: `attributes.${key}`,
        code: "UNKNOWN_ATTRIBUTE",
      });
      return;
    }

    // Type-specific validation
    switch (attrSchema.kind) {
      case "enum":
        if (!attrSchema.values.includes(value as string)) {
          errors.push({
            message: `Invalid enum value: ${value}`,
            path: `attributes.${key}`,
            code: "INVALID_ENUM_VALUE",
          });
        }
        break;
      // ... other validations
    }
  });

  return { ok: errors.length === 0, errors };
}
```

### Batch Validation

```typescript
function validateItemBatch<C extends ConfigSpec>(
  items: ItemSpec<C>[],
  config: C
): {
  valid: ItemSpec<C>[];
  invalid: Array<{ item: ItemSpec<C>; errors: ValidationError[] }>;
} {
  const valid: ItemSpec<C>[] = [];
  const invalid: Array<{ item: ItemSpec<C>; errors: ValidationError[] }> = [];

  items.forEach((item) => {
    const result = validateItem(item, config);
    if (result.ok) {
      valid.push(item);
    } else {
      invalid.push({ item, errors: result.errors });
    }
  });

  return { valid, invalid };
}
```

_Context added by Giga validation-rules - using core validation components, attribute validation, and configuration schema validation information._
