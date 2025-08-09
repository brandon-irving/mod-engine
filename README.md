# 🛡️ Mod-Engine

A lightweight, type-safe TypeScript library for building item modification systems with deterministic evaluation.

[![npm version](https://badge.fury.io/js/mod-engine.svg)](https://badge.fury.io/js/mod-engine)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen)](https://brandon-irving.github.io/mod-engine/)

## ✨ Why Mod-Engine?

**🔒 Type-Safe** - Complete compile-time validation with TypeScript inference  
**⚡ Performant** - Zero runtime dependencies, efficient evaluation algorithms  
**🎯 Deterministic** - Consistent results with predictable modifier stacking  
**🧩 Flexible** - Works with any domain: games, configuration systems, calculations  
**🛠️ Developer-Friendly** - Fluent API with comprehensive error handling

## 🚀 Quick Example

```typescript
import { defineConfig, createEngine } from "mod-engine";

// Define your domain
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
  ] as const,
});

const engine = createEngine(config);

// Prefer initializing attributes from a defaults object
const attributeDefaults = {
  Rarity: "Epic" as const,
  Level: 50,
};

// Build items with modifiers using native bulk attribute setter
const epicSword = engine
  .builder("Epic Sword")
  .setAttributes(attributeDefaults)
  .increase("Damage")
  .by(100)
  .when({ op: "eq", attr: "Rarity", value: "Epic" })
  .multiply("Damage")
  .by(1.5)
  .build();

// Get final stats
const result = engine.evaluate(epicSword);
console.log(result.metrics); // { Health: 0, Damage: 150, Speed: 0 }
```

## 🎮 Perfect For

- **RPG Systems** - Character stats, equipment modifiers, skill bonuses
- **Configuration Engines** - Dynamic settings with conditional logic
- **Financial Modeling** - Fee calculations, discount rules, tax modifiers
- **Game Balancing** - Predictable buff/debuff systems
- **Any System** requiring conditional numeric modifications

## 📚 Documentation

**[📖 Complete Documentation](https://brandon-irving.github.io/mod-engine/)**

- **[Quick Start Guide](https://brandon-irving.github.io/mod-engine/docs/quick-start)** - Get up and running in minutes
- **[API Reference](https://brandon-irving.github.io/mod-engine/docs/api/overview)** - Detailed function documentation
- **[Interactive Demo](https://brandon-irving.github.io/mod-engine/docs/examples/nextjs-demo)** - Try it in your browser
- **[Core Concepts](https://brandon-irving.github.io/mod-engine/docs/concepts/overview)** - Understanding the system

## 🛠️ Installation

```bash
npm install mod-engine
```

## 🎯 Try the Demo

```bash
npx create-mod-engine-app my-app
# or
git clone https://github.com/brandon-irving/mod-engine
cd mod-engine && npm start
```

## 📝 License

MIT - Build amazing systems with confidence!

---

**[⭐ Star us on GitHub](https://github.com/brandon-irving/mod-engine)** | **[📖 Read the Docs](https://brandon-irving.github.io/mod-engine/)** | **[🐛 Report Issues](https://github.com/brandon-irving/mod-engine/issues)**
