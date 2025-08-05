# Mod-Engine Next.js Example

This is a comprehensive Next.js example demonstrating the **mod-engine** library's capabilities for building RPG-style item modification systems.

## 🚀 Features Demonstrated

- **Interactive Item Builder**: Real-time item configuration with attributes and modifiers
- **Type-Safe Configuration**: Full TypeScript support with autocomplete
- **Custom Operations**: Power, clamp, percentage, and more advanced operations
- **Conditional Modifiers**: Apply modifiers based on item attributes
- **Stacking Rules**: Control how multiple modifiers combine
- **Priority System**: Deterministic evaluation order
- **Validation**: Comprehensive item and configuration validation
- **Prebuilt Examples**: Common patterns and use cases

## 🛠️ Installation & Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Project Structure

```
examples/nextjs-example/
├── app/                    # Next.js 13+ app directory
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx          # Main demo page
│   └── examples/
│       └── page.tsx      # Prebuilt examples page
├── components/           # React components
│   ├── ItemBuilder.tsx   # Main interactive builder
│   ├── ModifierForm.tsx  # Modifier configuration form
│   ├── ItemDisplay.tsx   # Item visualization
│   ├── EvaluationResults.tsx # Results display
│   └── PrebuiltExamples.tsx  # Example showcase
├── lib/
│   └── engine-config.ts  # RPG engine configuration
├── types/
│   └── ui.ts            # TypeScript interfaces
└── package.json         # Dependencies and scripts
```

## 🎮 How to Use

### 1. Main Interactive Demo

- Navigate to the home page
- Configure item attributes (name, rarity, level, etc.)
- Add modifiers with different operations
- Set conditions for when modifiers apply
- Click "Build & Evaluate" to see results

### 2. Prebuilt Examples

- Visit the `/examples` page
- Click on any example to see its evaluation
- Study the patterns for common use cases

## 🔧 Key Concepts Demonstrated

### Engine Configuration

```typescript
// Define metrics, operations, and attributes
const config = defineConfig({
  metrics: ["Health", "Strength", "Speed", "Mana"] as const,
  operations: [...builtinOps("sum", "multiply"), "pow", "clamp"] as const,
  attributes: [
    /* attribute schemas */
  ] as const,
});
```

### Item Building

```typescript
// Use the fluent builder API
const item = engine
  .builder("Magic Sword")
  .set("Rarity", "Epic")
  .increase("Damage")
  .by(100)
  .when({ op: "eq", attr: "Enchanted", value: true })
  .multiply("Damage")
  .by(1.5)
  .build();
```

### Custom Operations

```typescript
// Register custom operations with precedence
engine.registerOperation("pow", powerOperation, { precedence: 30 });
engine.registerOperation("clamp", clampOperation, { precedence: 5 });
```

## 📊 Example Use Cases

1. **RPG Equipment Systems**: Weapons, armor, and accessories with level scaling
2. **Buff/Debuff Systems**: Temporary or permanent stat modifications
3. **Enchantment Mechanics**: Conditional bonuses based on item properties
4. **Upgrade Systems**: Progressive enhancement with quality scaling
5. **Configuration Engines**: Rule-based systems with complex logic

## 🎯 Advanced Features

### Conditional Modifiers

- Apply modifiers only when certain conditions are met
- Supports equality, comparison, and inclusion operators
- Works with any item attribute

### Stacking Rules

- **Default**: All modifiers stack normally
- **Unique**: Only one modifier per source applies

### Operation Precedence

- Control the order of modifier application
- Built-in operations have sensible defaults
- Custom operations can specify their precedence

### Type Safety

- Full TypeScript integration
- Autocomplete for metrics, operations, and attributes
- Compile-time validation of configurations

## 🚫 Bundle Exclusion

This example is configured to be **completely excluded** from the main mod-engine package:

- Listed in `.gitignore` patterns
- Not included in the `files` field of package.json
- Marked as `"private": true` in its own package.json
- Uses `file:../../` dependency for development

When consumers install `mod-engine`, this example and all other examples are automatically excluded from the bundle.

## 📚 Learn More

- [Mod-Engine Documentation](#) - Complete API reference
- [TypeScript Integration](#) - Advanced typing patterns
- [Performance Guide](#) - Optimization best practices
- [Migration Guide](#) - Upgrading from older versions

## 🤝 Contributing

Found a bug or want to add a feature to this example?

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This example is part of the mod-engine project and is released under the MIT License.
