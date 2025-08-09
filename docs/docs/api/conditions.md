# Conditions API

The conditions module provides functionality for creating and evaluating conditional logic that determines when modifiers should be applied.

## evaluateCondition

Evaluates a condition against item attributes.

### Signature

```typescript
function evaluateCondition<C extends ConfigSpec>(
  condition: Condition<C>,
  attributes: Attributes<C>
): boolean;
```

### Parameters

- `condition` - Condition to evaluate
- `attributes` - Item attributes to test against

### Returns

`true` if the condition is satisfied, `false` otherwise.

## validateCondition

Validates that a condition is well-formed.

### Signature

```typescript
function validateCondition<C extends ConfigSpec>(
  condition: Condition<C>,
  config: C
): ValidationResult;
```

### Parameters

- `condition` - Condition to validate
- `config` - Configuration schema

### Returns

`ValidationResult` indicating success or failure with error details.

## Condition Types

### Simple Conditions

#### Equality

```typescript
{ op: "eq", attr: "Rarity", value: "Epic" }
```

Tests if attribute equals the specified value.

#### Comparison Operations

```typescript
// Greater than
{ op: "gt", attr: "Level", value: 50 }

// Greater than or equal
{ op: "gte", attr: "Level", value: 50 }

// Less than
{ op: "lt", attr: "Level", value: 100 }

// Less than or equal
{ op: "lte", attr: "Level", value: 100 }
```

#### Inclusion

```typescript
// Value in array
{ op: "in", attr: "Rarity", values: ["Epic", "Legendary"] }

// Array contains value (for multi-value attributes)
{ op: "includes", attr: "Tags", value: "Weapon" }
```

### Logical Conditions

#### AND Logic

```typescript
{
  op: "and",
  clauses: [
    { op: "eq", attr: "Enchanted", value: true },
    { op: "gte", attr: "Level", value: 25 }
  ]
}
```

#### OR Logic

```typescript
{
  op: "or",
  clauses: [
    { op: "eq", attr: "Rarity", value: "Epic" },
    { op: "eq", attr: "Rarity", value: "Legendary" }
  ]
}
```

#### NOT Logic

```typescript
{
  op: "not",
  clause: { op: "eq", attr: "Cursed", value: true }
}
```

### Complex Nested Conditions

```typescript
{
  op: "and",
  clauses: [
    { op: "eq", attr: "Class", value: "Warrior" },
    {
      op: "or",
      clauses: [
        { op: "gte", attr: "Level", value: 50 },
        { op: "eq", attr: "HasExperience", value: true }
      ]
    },
    {
      op: "not",
      clause: { op: "eq", attr: "Cursed", value: true }
    }
  ]
}
```

## createConditionBuilder

Helper function for building complex conditions with a fluent API.

### Signature

```typescript
function createConditionBuilder<C extends ConfigSpec>(): ConditionBuilder<C>;
```

### ConditionBuilder Methods

#### eq()

```typescript
eq<K extends AttrKeyOf<C>>(attr: K, value: AttrValueOf<C, K>): Condition<C>
```

#### gt(), gte(), lt(), lte()

```typescript
gt<K extends AttrKeyOf<C>>(attr: K, value: number): Condition<C>
gte<K extends AttrKeyOf<C>>(attr: K, value: number): Condition<C>
lt<K extends AttrKeyOf<C>>(attr: K, value: number): Condition<C>
lte<K extends AttrKeyOf<C>>(attr: K, value: number): Condition<C>
```

#### includes()

```typescript
includes<K extends AttrKeyOf<C>>(
  attr: K,
  value: AttrValueOf<C, K>[]
): Condition<C>
```

#### and()

```typescript
and(...conditions: Condition<C>[]): Condition<C>
```

#### or()

```typescript
or(...conditions: Condition<C>[]): Condition<C>
```

#### not()

```typescript
not(condition: Condition<C>): Condition<C>
```

### Example Usage

```typescript
import { createConditionBuilder } from "mod-engine";

const builder = createConditionBuilder<typeof config>();

// Simple condition
const isEpic = builder.eq("Rarity", "Epic");

// Complex condition
const isEliteWarrior = builder.and(
  builder.eq("Class", "Warrior"),
  builder.gte("Level", 50),
  builder.or(
    builder.eq("HasTitle", true),
    builder.includes("Achievements", ["Dragon Slayer", "Hero"])
  )
);

// Use in modifier
const item = engine
  .builder("Elite Sword")
  .when(isEliteWarrior)
  .multiply("Damage")
  .by(2.0)
  .build();
```

## Practical Examples

### Character Progression

```typescript
const characterDefaults = {
  Class: "Mage" as const,
  Level: 35,
  HasSpellbook: true,
};

const item = engine
  .builder("Mage Staff")
  .set("Class", characterDefaults.Class)
  .set("Level", characterDefaults.Level)
  .set("HasSpellbook", characterDefaults.HasSpellbook)
  // Mage bonus
  .when({ op: "eq", attr: "Class", value: "Mage" })
  .increase("Mana")
  .by(100)
  // High level bonus
  .when({ op: "gte", attr: "Level", value: 30 })
  .multiply("Mana")
  .by(1.5)
  // Spellbook synergy
  .when({
    op: "and",
    conditions: [
      { op: "eq", attr: "Class", value: "Mage" },
      { op: "eq", attr: "HasSpellbook", value: true },
    ],
  })
  .increase("Mana")
  .by(50)
  .build();
```

### Equipment Restrictions

```typescript
const armorDefaults = {
  Type: "Heavy" as const,
  RequiredStrength: 15,
  PlayerStrength: 18,
};

const armor = engine
  .builder("Plate Armor")
  .set("Type", armorDefaults.Type)
  .set("RequiredStrength", armorDefaults.RequiredStrength)
  .set("PlayerStrength", armorDefaults.PlayerStrength)
  // Only applies if player meets requirements
  .when({
    op: "gte",
    attr: "PlayerStrength",
    value: armorDefaults.RequiredStrength,
  })
  .increase("Defense")
  .by(100)
  // Heavy armor penalty
  .when({ op: "eq", attr: "Type", value: "Heavy" })
  .decrease("Speed")
  .by(10)
  .build();
```

### Rarity-Based Scaling

```typescript
const weaponDefaults = {
  Rarity: "Legendary" as const,
  Enchanted: true,
  Quality: 95,
};

const weapon = engine
  .builder("Legendary Blade")
  .set("Rarity", weaponDefaults.Rarity)
  .set("Enchanted", weaponDefaults.Enchanted)
  .set("Quality", weaponDefaults.Quality)
  // Base rare item bonus
  .when({
    op: "includes",
    attr: "Rarity",
    value: ["Rare", "Epic", "Legendary"],
  })
  .multiply("Damage")
  .by(1.2)
  // Epic+ bonus
  .when({ op: "includes", attr: "Rarity", value: ["Epic", "Legendary"] })
  .increase("CritChance")
  .by(10)
  // Legendary exclusive
  .when({ op: "eq", attr: "Rarity", value: "Legendary" })
  .multiply("Damage")
  .by(1.5)
  // High quality enchanted combo
  .when({
    op: "and",
    conditions: [
      { op: "eq", attr: "Enchanted", value: true },
      { op: "gte", attr: "Quality", value: 90 },
    ],
  })
  .increase("Damage")
  .by(75)
  .build();
```

### Multi-Condition Chains

```typescript
const questItemDefaults = {
  QuestComplete: true,
  PlayerLevel: 60,
  HasGuild: true,
  GuildRank: "Officer" as const,
};

const questReward = engine
  .builder("Guild Officer Reward")
  .set("QuestComplete", questItemDefaults.QuestComplete)
  .set("PlayerLevel", questItemDefaults.PlayerLevel)
  .set("HasGuild", questItemDefaults.HasGuild)
  .set("GuildRank", questItemDefaults.GuildRank)
  // Must complete quest
  .when({ op: "eq", attr: "QuestComplete", value: true })
  .increase("Experience")
  .by(1000)
  // High level player bonus
  .when({
    op: "and",
    conditions: [
      { op: "eq", attr: "QuestComplete", value: true },
      { op: "gte", attr: "PlayerLevel", value: 50 },
    ],
  })
  .multiply("Experience")
  .by(1.5)
  // Guild officer exclusive bonus
  .when({
    op: "and",
    conditions: [
      { op: "eq", attr: "HasGuild", value: true },
      { op: "includes", attr: "GuildRank", value: ["Officer", "Leader"] },
    ],
  })
  .increase("GuildTokens")
  .by(100)
  .build();
```

## Error Handling

### ConditionError

Thrown when condition evaluation fails:

```typescript
import { ConditionError } from "mod-engine";

try {
  const result = evaluateCondition(condition, attributes);
} catch (error) {
  if (error instanceof ConditionError) {
    console.error("Condition failed:", error.message);
  }
}
```

### Common Error Cases

- Referencing non-existent attributes
- Type mismatches (comparing string to number)
- Malformed condition structure
- Circular condition references

## Performance Considerations

### Efficient Conditions

```typescript
// ✅ Fast - simple equality check
{ op: "eq", attr: "Enchanted", value: true }

// ✅ Fast - direct comparison
{ op: "gte", attr: "Level", value: 50 }

// ❌ Slower - complex nested conditions
{
  op: "and",
  conditions: [
    { op: "or", conditions: [...] },
    { op: "not", condition: { op: "and", conditions: [...] } }
  ]
}
```

### Condition Caching

The evaluation engine automatically caches condition results for identical conditions within the same evaluation context.

_Context added by Giga evaluation-algorithms - using condition evaluation engine information and complex logical condition handling._
