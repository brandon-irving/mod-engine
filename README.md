### Custom operations (typed)

Register domain-specific operations with full type-safety:

```typescript
import type { MetricOf } from "mod-engine";

engine.registerOperation("percent", (current, value) => current * (1 + value), {
  precedence: 20,
});

// Compile-time enforcement – `.by()` only accepts numbers
engine.builder().apply("Health", "percent").by(0.15);
```

### Number safety

Every engine math operation is validated:

- **NaN / Infinity** – throws `EvaluationError` by default.
- **Division by zero** – operation implementation decides (built-in divide clamps to `Infinity`).
- **Configurable policy** – provide your own operation variant and decide whether to `error`, `clamp`, or `ignore`.

### Performance notes

The evaluator is designed for real-time usage:

- Modifiers are **pre-sorted by precedence** once, avoiding repeated work.
- Conditions are **compiled to predicates** so runtime checks are cheap.
- Modifiers are **indexed by metric**, making evaluation `O(n + m)` where `n = modifiers`, `m = metrics`.

### Explain – full applied trace

```typescript
const result = engine.evaluate(item);
const trace = explainEvaluation(result);
// trace[0] → { metric: 'Health', operation: 'multiply', value: 1.2, before: 100, after: 120, priority: 10, conditionMatched: true }
```

The trace format is stable (see `AppliedTrace` type) and safe to feed to UIs.
