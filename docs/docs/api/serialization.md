# Serialization API

The serialization module provides functions for converting mod-engine objects to and from JSON, enabling persistence, network transfer, and data exchange.

## Core Serialization Functions

### serializeItem

Converts an item specification to a serializable format.

```typescript
function serializeItem<C extends ConfigSpec>(
  item: ItemSpec<C>
): SerializedData<ItemSpec<C>>;
```

#### Parameters

- `item` - Item specification to serialize

#### Returns

`SerializedData<ItemSpec<C>>` containing the item data with metadata.

#### Example

```typescript
import { serializeItem } from "mod-engine";

const item = engine
  .builder("Magic Sword")
  .set("Rarity", "Epic")
  .increase("Damage")
  .by(50)
  .build();

const serialized = serializeItem(item);
console.log(serialized);
// {
//   data: { name: "Magic Sword", attributes: {...}, modifiers: [...] },
//   version: "1.0.0",
//   timestamp: 1640995200000
// }
```

### deserializeItem

Converts serialized data back to an item specification.

```typescript
function deserializeItem<C extends ConfigSpec>(
  serialized: SerializedData<ItemSpec<C>>
): ItemSpec<C>;
```

#### Parameters

- `serialized` - Serialized item data

#### Returns

Reconstructed `ItemSpec<C>` object.

#### Example

```typescript
import { deserializeItem } from "mod-engine";

const originalItem = deserializeItem(serialized);
// originalItem is identical to the original item
```

### serializeEvaluationResult

Serializes evaluation results including metrics and application traces.

```typescript
function serializeEvaluationResult<C extends ConfigSpec>(
  result: EvaluationResult<C>
): SerializedData<EvaluationResult<C>>;
```

#### Example

```typescript
const result = engine.evaluate(item);
const serializedResult = serializeEvaluationResult(result);

console.log(serializedResult.data.metrics);
// { Health: 0, Damage: 50 }

console.log(serializedResult.data.applied.length);
// Number of applied modifiers
```

### deserializeEvaluationResult

Deserializes evaluation results.

```typescript
function deserializeEvaluationResult<C extends ConfigSpec>(
  serialized: SerializedData<EvaluationResult<C>>
): EvaluationResult<C>;
```

## Modifier Serialization

### serializeModifiers

Serializes an array of modifiers.

```typescript
function serializeModifiers<C extends ConfigSpec>(
  modifiers: readonly Modifier<C>[]
): SerializedData<readonly Modifier<C>[]>;
```

### deserializeModifiers

Deserializes an array of modifiers.

```typescript
function deserializeModifiers<C extends ConfigSpec>(
  serialized: SerializedData<readonly Modifier<C>[]>
): readonly Modifier<C>[];
```

#### Example

```typescript
const modifiers = [
  { metric: "Health", operation: "sum", value: 100 },
  { metric: "Damage", operation: "multiply", value: 1.5 },
];

const serialized = serializeModifiers(modifiers);
const deserialized = deserializeModifiers(serialized);
// deserialized is identical to original modifiers
```

## JSON Utilities

### toJSON

Converts serialized data to a JSON string.

```typescript
function toJSON<T>(serialized: SerializedData<T>): string;
```

#### Parameters

- `serialized` - Serialized data object

#### Returns

JSON string representation.

#### Example

```typescript
import { toJSON } from "mod-engine";

const jsonString = toJSON(serializeItem(item));
console.log(jsonString);
// '{"data":{"name":"Magic Sword",...},"version":"1.0.0","timestamp":...}'
```

### fromJSON

Parses a JSON string back to serialized data.

```typescript
function fromJSON<T>(json: string): SerializedData<T>;
```

#### Parameters

- `json` - JSON string to parse

#### Returns

Parsed `SerializedData<T>` object.

#### Throws

`SerializationError` if JSON is malformed or invalid.

#### Example

```typescript
import { fromJSON } from "mod-engine";

const parsed = fromJSON<ItemSpec<Config>>(jsonString);
const item = deserializeItem(parsed);
```

## Utility Functions

### deepClone

Creates a deep copy of an object.

```typescript
function deepClone<T>(obj: T): T;
```

#### Example

```typescript
import { deepClone } from "mod-engine";

const original = { name: "Sword", stats: { damage: 50 } };
const copy = deepClone(original);

copy.stats.damage = 75;
console.log(original.stats.damage); // Still 50
```

## SerializedData Structure

### Format

```typescript
interface SerializedData<T> {
  readonly data: T;
  readonly version: string;
  readonly timestamp: number;
}
```

#### Properties

- `data` - The actual serialized object
- `version` - Mod-engine version used for serialization
- `timestamp` - Unix timestamp of serialization

### Version Compatibility

The serialization format includes version information for compatibility checking:

```typescript
const serialized = serializeItem(item);
console.log(serialized.version); // "1.0.0"

// Future versions can check compatibility
if (serialized.version !== currentVersion) {
  console.warn("Version mismatch - migration may be needed");
}
```

## Complete Workflow Examples

### Saving Items to Database

```typescript
// Create and serialize item
const itemDefaults = {
  Rarity: "Epic" as const,
  Level: 50,
  Enchanted: true,
};

const item = engine
  .builder("Player Sword")
  .set("Rarity", itemDefaults.Rarity)
  .set("Level", itemDefaults.Level)
  .set("Enchanted", itemDefaults.Enchanted)
  .increase("Damage")
  .by(100)
  .when({ op: "eq", attr: "Enchanted", value: true })
  .multiply("Damage")
  .by(1.5)
  .build();

// Serialize for storage
const serialized = serializeItem(item);
const jsonData = toJSON(serialized);

// Save to database
await database.items.create({
  playerId: "user123",
  itemData: jsonData,
  createdAt: new Date(serialized.timestamp),
});
```

### Loading Items from Database

```typescript
// Load from database
const record = await database.items.findById("item456");

// Deserialize
const serialized = fromJSON<ItemSpec<Config>>(record.itemData);
const item = deserializeItem(serialized);

// Use the item
const result = engine.evaluate(item);
console.log(`${item.name}: ${result.metrics.Damage} damage`);
```

### API Response Serialization

```typescript
// API endpoint
app.get("/api/items/:id", async (req, res) => {
  const item = await getItemById(req.params.id);
  const result = engine.evaluate(item);

  // Serialize both item and result
  const response = {
    item: serializeItem(item),
    evaluation: serializeEvaluationResult(result),
    timestamp: Date.now(),
  };

  res.json(response);
});

// Client-side deserialization
const response = await fetch("/api/items/123").then((r) => r.json());
const item = deserializeItem(response.item);
const result = deserializeEvaluationResult(response.evaluation);
```

### Batch Operations

```typescript
// Serialize multiple items
function serializeItemBatch<C extends ConfigSpec>(
  items: ItemSpec<C>[]
): SerializedData<ItemSpec<C>[]> {
  return {
    data: items,
    version: "1.0.0",
    timestamp: Date.now(),
  };
}

// Deserialize multiple items
function deserializeItemBatch<C extends ConfigSpec>(
  serialized: SerializedData<ItemSpec<C>[]>
): ItemSpec<C>[] {
  return serialized.data;
}

// Usage
const items = [sword, shield, armor];
const batchSerialized = serializeItemBatch(items);
const batchJson = toJSON(batchSerialized);

// Later...
const parsedBatch = fromJSON<ItemSpec<Config>[]>(batchJson);
const restoredItems = deserializeItemBatch(parsedBatch);
```

### Export/Import System

```typescript
// Export player inventory
function exportInventory(playerItems: ItemSpec<Config>[]) {
  const inventory = {
    items: playerItems.map((item) => serializeItem(item)),
    exportedAt: Date.now(),
    version: "1.0.0",
  };

  return toJSON({ data: inventory, version: "1.0.0", timestamp: Date.now() });
}

// Import player inventory
function importInventory(jsonData: string): ItemSpec<Config>[] {
  const parsed = fromJSON<{
    items: SerializedData<ItemSpec<Config>>[];
    exportedAt: number;
    version: string;
  }>(jsonData);

  return parsed.data.items.map((serializedItem) =>
    deserializeItem(serializedItem)
  );
}
```

## Error Handling

### SerializationError

Thrown when serialization/deserialization fails:

```typescript
import { SerializationError } from "mod-engine";

try {
  const parsed = fromJSON<ItemSpec<Config>>(invalidJson);
} catch (error) {
  if (error instanceof SerializationError) {
    console.error("Serialization failed:", error.message);
  }
}
```

### Common Error Cases

- Malformed JSON strings
- Missing required properties
- Type mismatches after deserialization
- Version incompatibilities
- Circular references in objects

### Safe Serialization

```typescript
function safeSerializeItem<C extends ConfigSpec>(
  item: ItemSpec<C>
): string | null {
  try {
    const serialized = serializeItem(item);
    return toJSON(serialized);
  } catch (error) {
    console.error("Failed to serialize item:", error);
    return null;
  }
}

function safeDeserializeItem<C extends ConfigSpec>(
  jsonData: string
): ItemSpec<C> | null {
  try {
    const parsed = fromJSON<ItemSpec<C>>(jsonData);
    return deserializeItem(parsed);
  } catch (error) {
    console.error("Failed to deserialize item:", error);
    return null;
  }
}
```

## Performance Considerations

### Large Objects

For large item collections, consider:

- Streaming serialization for very large datasets
- Compression of JSON data
- Pagination for API responses

### Memory Usage

- Serialization creates copies of objects
- Use streaming for memory-constrained environments
- Clean up intermediate objects promptly

### Network Transfer

```typescript
// Optimize for network transfer
function compressItemData<C extends ConfigSpec>(item: ItemSpec<C>): string {
  const serialized = serializeItem(item);
  const json = toJSON(serialized);

  // Could add compression here
  return json;
}
```

_Context added by Giga data-models - using serialization formats and snapshot data models information._
