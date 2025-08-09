# Next.js Interactive Demo

👉 Live demo: <a href="/mod-engine/demo/" data-noBrokenLink>Open the embedded Next.js demo</a>

The Next.js demo provides a complete interactive experience for exploring Mod-Engine capabilities.

## Running the Demo

From the project root:

```bash
npm start
```

This will:

1. Install dependencies if needed
2. Build the mod-engine library
3. Start the Next.js development server
4. Open your browser to [http://localhost:3000](http://localhost:3000)

## Features

### Item Builder

- **Visual Interface** - Build items using forms and dropdowns
- **Real-time Validation** - See errors as you type
- **Attribute Setting** - Configure rarity, level, enchantment status
- **Modifier Creation** - Add conditional modifiers with priorities

### Live Evaluation

- **Instant Results** - See metric changes in real-time
- **Evaluation Trace** - Complete history of modifier applications
- **Applied Modifiers** - List of which modifiers took effect
- **Visual Feedback** - Color-coded metrics and validation states

### Pre-built Examples

- **Character Classes** - Warrior, Mage, Rogue with unique bonuses
- **Equipment Types** - Weapons, armor, accessories with realistic stats
- **Enchantment Systems** - Fire, Ice, Lightning with different effects
- **Quality Grades** - Poor to Legendary with scaling bonuses

## Code Structure

The demo showcases several important patterns:

### Configuration

Located in `examples/nextjs-example/lib/rpg-sdk/config.ts`:

```typescript
export const rpgConfig = defineConfig({
  metrics: [
    "Health",
    "Damage",
    "Defense",
    "Speed",
    "Strength",
    "Mana",
  ] as const,
  operations: ["sum", "subtract", "multiply"] as const,
  attributes: [
    {
      key: "Rarity",
      kind: "enum",
      values: ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const,
    },
    // ... more attributes
  ] as const,
});
```

### Helper Functions

The RPG SDK provides utilities for UI development:

```typescript
// Get appropriate input type for an attribute
const inputType = getInputTypeForAttribute("Rarity"); // "select"

// Get default values
const defaultValue = getDefaultValueForAttribute("Level"); // 1

// Format display values
const formatted = formatMetricValue(123.456); // "123.5"
const color = getMetricColor(75); // "text-yellow-600"
```

### Component Architecture

#### ItemBuilder Component

- Manages item state and modifiers
- Provides form inputs for all attributes
- Handles modifier creation and editing
- Validates configuration in real-time

#### EvaluationResults Component

- Displays final metrics with color coding
- Shows complete evaluation trace
- Lists applied vs. rejected modifiers
- Provides export functionality

#### ModifierForm Component

- Handles individual modifier creation
- Supports all operation types
- Manages conditional logic
- Validates modifier configurations

## Learning Opportunities

### Type Safety

See how TypeScript prevents errors:

```typescript
// ❌ This would cause a compile error
.set("InvalidAttribute", "value")

// ✅ This works with autocompletion
.set("Rarity", "Epic")
```

### Conditional Logic

Explore complex condition patterns:

```typescript
// Simple condition
.when({ op: "eq", attr: "Enchanted", value: true })

// Range condition
.when({ op: "gte", attr: "Level", value: 50 })

// Multiple values
.when({ op: "includes", attr: "Tags", value: ["Weapon", "Magic"] })
```

### Priority Systems

Understand modifier ordering:

```typescript
// High priority (applied first)
.with({ priority: 100 })
.increase("Damage").by(50)

// Low priority (applied last)
.with({ priority: 10 })
.multiply("Damage").by(1.5)
```

## Customization

### Adding New Metrics

1. Update the configuration in `config.ts`
2. Add to the base metrics in `constants.ts`
3. Update the UI components to display the new metric

### Creating New Attributes

1. Add to the attributes array in configuration
2. Update the UI helpers if needed
3. Add validation rules as appropriate

### New Operation Types

1. Implement the operation in your configuration
2. Register it with the engine
3. Update the UI to include the new operation

## Deployment

The demo is embedded into the documentation and available at `/mod-engine/demo/`. It can also be deployed to any platform that supports Next.js:

```bash
# Build for production
cd examples/nextjs-example
npm run build

# Start production server
npm start
```

Popular deployment options:

- **Vercel** - Zero-config deployment
- **Netlify** - Static site hosting
- **AWS Amplify** - Full-stack hosting
- **Docker** - Containerized deployment

## Source Code

The complete demo source is available in the repository:

- `examples/nextjs-example/` - Main application
- `examples/nextjs-example/lib/rpg-sdk/` - Helper library
- `examples/nextjs-example/components/` - React components

## Next Steps

After exploring the demo:

- Study the [source code](https://github.com/brandon-irving/mod-engine/tree/main/examples/nextjs-example)
- Read the [concepts](../concepts/overview.md) for implementation details
- Check the [API reference](../api/overview.md) for complete documentation
