# Engine Builder Mental Model

This guide explains how to think about the Engine Builder: what it builds, how it composes attributes and modifiers, and how conditions, metadata, and evaluation interact.

## Core Idea

- The builder constructs an immutable `ItemSpec` that contains:
  - Attributes: descriptive properties about the item (e.g., `Rarity`, `Level`, `Enchanted`).
  - Modifiers: rules that change numeric metrics (e.g., `Health`, `Damage`, `Speed`).
- The engine evaluates your `ItemSpec` by applying valid modifiers to metrics, producing final numbers and a trace of what happened.

## Attributes vs Metrics

- Attributes are inputs and context. They do not directly change numbers. They are used by conditions to decide which modifiers apply.
- Metrics are numeric outputs that modifiers change using operations.

Example:

```ts
const config = defineConfig({
  metrics: ["Health", "Damage", "Speed"] as const,
  operations: ["sum", "multiply"] as const,
  attributes: [
    {
      key: "Rarity",
      kind: "enum",
      values: ["Common", "Rare", "Epic"] as const,
    },
    { key: "Level", kind: "number", min: 1, max: 100 },
    { key: "Enchanted", kind: "boolean" },
  ] as const,
});
```

- `Rarity`, `Level`, `Enchanted` are attributes.
- `Health`, `Damage`, `Speed` are metrics that modifiers will change.

## Builder Phases

1. Set attributes (context):

```ts
const item = engine
  .builder("Epic Sword")
  .setAttributes({ Rarity: "Epic", Level: 50, Enchanted: true })
  // ...
  .build();
```

2. Add modifiers (effects):

```ts
const item = engine
  .builder()
  .increase("Damage")
  .by(100) // +100
  .multiply("Damage")
  .by(1.5) // *1.5
  .build();
```

## Conditions (when)

Conditions filter which modifiers apply. A condition set with `.when(...)` affects all subsequent modifiers until the context is cleared or changed.

```ts
const item = engine
  .builder()
  .set("Rarity", "Epic")
  .when({ op: "eq", attr: "Rarity", value: "Epic" })
  .multiply("Damage")
  .by(1.5) // applies only if Rarity === "Epic"
  .build();
```

Key points:

- Conditions reference attributes, not metrics.
- The builder automatically scopes conditions to modifiers added after `.when(...)`.

## Metadata (with)

Use `.with({ priority, stacking, source })` to set metadata for subsequent modifiers:

- priority: higher values apply later in the evaluation (controls application order between modifiers at the same precedence).
- stacking: control uniqueness rules (e.g., unique by `source`).
- source: identifier for uniqueness or audit.

```ts
const item = engine
  .builder()
  .with({ priority: 100 })
  .increase("Damage")
  .by(25)
  .with({ stacking: "unique", source: "fire-enchant" })
  .increase("Damage")
  .by(50)
  .build();
```

## Grouping

Use `.group({ when, with }, (b) => { ... })` to apply a temporary scope for conditions and metadata to multiple modifiers in one place. Outside the group, previous context is restored.

```ts
const item = engine
  .builder()
  .group(
    {
      when: { op: "eq", attr: "Enchanted", value: true },
      with: { priority: 50 },
    },
    (b) => {
      b.increase("Damage").by(20);
      b.increase("Speed").by(5);
    }
  )
  .build();
```

## Evaluation Order (mental model)

- Start metrics at a base (typically 0).
- Filter modifiers by conditions (based on attributes).
- Sort modifiers by:
  1. Operation precedence (e.g., multiply after sum/subtract).
  2. Priority (higher runs later).
- Apply modifiers in order. Track `before` → `after` per modifier.
- Respect stacking rules (e.g., unique by `source` keeps the highest absolute value).

This yields deterministic, predictable results.

## Defaults via setAttributes

Prefer initializing attributes from a defaults object:

```ts
const defaults = { Rarity: "Epic" as const, Level: 50 };

const epic = engine
  .builder("Epic Sword")
  .setAttributes(defaults)
  .when({ op: "eq", attr: "Rarity", value: "Epic" })
  .multiply("Damage")
  .by(1.5)
  .build();
```

## Putting It Together

```ts
const item = engine
  .builder("Epic Sword")
  .setAttributes({ Rarity: "Epic", Level: 50, Enchanted: true })
  .increase("Damage")
  .by(100)
  .when({ op: "eq", attr: "Rarity", value: "Epic" })
  .multiply("Damage")
  .by(1.5)
  .group(
    {
      when: { op: "eq", attr: "Enchanted", value: true },
      with: { priority: 25 },
    },
    (b) => {
      b.increase("Speed").by(10);
    }
  )
  .build();

const result = engine.evaluate(item);
// result.metrics has final numbers; explainEvaluation(result) shows the trace
```

See also:

- Concepts: [Overview](./overview.md), [Items and Attributes](./items-and-attributes.md)
- API: [Builder](../api/builder.md), [Evaluation](../api/evaluation.md), [Conditions](../api/conditions.md)
