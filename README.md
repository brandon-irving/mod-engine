![Logo](https://private-user-images.githubusercontent.com/19963935/473248257-647dc4ef-4ce7-49c4-8615-4b7ee0092f19.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTQwMTI4MDYsIm5iZiI6MTc1NDAxMjUwNiwicGF0aCI6Ii8xOTk2MzkzNS80NzMyNDgyNTctNjQ3ZGM0ZWYtNGNlNy00OWM0LTg2MTUtNGI3ZWUwMDkyZjE5LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA4MDElMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwODAxVDAxNDE0NlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTM1NmU1M2E1MTNjMjdhMjQzZmM3MWIyNDg1ZTM5ZGRiODM1MDU2ZmYzMzBkNWMyYTlkNDg2MjkwOWE4YTJkYmImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.cslzEGLQ_BTZiYqqcseM0aS06iadqKr6lLj39BTjxE0)

# 🛡️ Mod-Engine

A TypeScript library for typed attributes and modifiers with deterministic evaluation.

## 🚀 Quick Start

Try the interactive Next.js demo:

```bash
npm start
```

This will automatically:

- Install dependencies if needed
- Build and start the Next.js example
- Open an interactive demo at http://localhost:3000

## 📚 Documentation

_Coming soon_

## 🎮 Examples

- **[Next.js Interactive Demo](examples/nextjs-example/)** - Full-featured web application
- **[Basic Usage](examples/basic-usage.ts)** - Simple item creation and evaluation
- **[Custom Operations](examples/custom-operations.ts)** - Advanced operation patterns
- **[Enforced Operations](examples/enforced-operations.ts)** - Operation validation
- **[Snapshot Demo](examples/snapshot-demo.ts)** - Data serialization

## 🔧 Installation

```bash
npm install mod-engine
```

## ⚡ Quick Example

```typescript
import { defineConfig, createEngine } from "mod-engine";

// Define your configuration
const config = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: ["sum", "multiply"] as const,
  attributes: [
    {
      key: "Rarity",
      kind: "enum",
      values: ["Common", "Rare", "Epic"] as const,
    },
  ] as const,
});

// Create engine and build items
const engine = createEngine(config);

const sword = engine
  .builder("Magic Sword")
  .set("Rarity", "Epic")
  .increase("Damage")
  .by(100)
  .when({ op: "eq", attr: "Rarity", value: "Epic" })
  .multiply("Damage")
  .by(1.5)
  .build();

// Evaluate the item
const result = engine.evaluate(sword);
console.log(result.metrics); // { Health: 0, Damage: 150 }
```

## 📄 License

MIT
