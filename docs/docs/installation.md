# Installation

## Prerequisites

Mod-Engine requires Node.js 18 or higher and works with all modern package managers.

## Package Installation

### npm

```bash
npm install mod-engine
```

### yarn

```bash
yarn add mod-engine
```

### pnpm

```bash
pnpm add mod-engine
```

## TypeScript Support

Mod-Engine is written in TypeScript and includes complete type definitions. No additional `@types` packages are needed.

### TypeScript Configuration

For the best experience, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## Import Styles

Mod-Engine supports both ES modules and CommonJS:

### ES Modules (Recommended)

```typescript
import { defineConfig, createEngine } from "mod-engine";
```

### CommonJS

```javascript
const { defineConfig, createEngine } = require("mod-engine");
```

## Verification

Verify your installation by creating a simple configuration:

```typescript
import { defineConfig, createEngine } from "mod-engine";

const config = defineConfig({
  metrics: ["Health"] as const,
  operations: ["sum"] as const,
  attributes: [] as const,
});

const engine = createEngine(config);
console.log("Mod-Engine installed successfully!");
```

## Next Steps

Now that you have Mod-Engine installed, head over to the [Quick Start Guide](./quick-start.md) to build your first item with modifiers.
