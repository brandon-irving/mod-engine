import type { ConfigSpec, OperationImpl, OperationOf } from "./types.js";
import { validateConfig } from "./validation.js";
import { createBuiltInOperations } from "./operations.js";
import { createEngine, type Engine } from "./config.js";

/**
 * Type-safe engine builder that enforces operation registration
 */
export class EngineBuilder<C extends ConfigSpec> {
  private operations = createBuiltInOperations<C>();
  private builtinOps = new Set(["sum", "subtract", "multiply"]);

  constructor(private config: C) {
    validateConfig(config);
  }

  /**
   * Register a custom operation with its implementation
   */
  withOperation<OpName extends OperationOf<C>>(
    name: OpName extends "sum" | "subtract" | "multiply" ? never : OpName,
    impl: OperationImpl<C>,
    options?: { precedence?: number }
  ): EngineBuilder<C> {
    this.operations.set(name as string, {
      impl,
      precedence: options?.precedence ?? 0,
    });
    return this;
  }

  /**
   * Register multiple operations at once
   */
  withOperations(
    operations: Record<
      Exclude<OperationOf<C>, "sum" | "subtract" | "multiply">,
      { impl: OperationImpl<C>; precedence?: number }
    >
  ): EngineBuilder<C> {
    for (const [name, opInfo] of Object.entries(operations)) {
      const { impl, precedence } = opInfo as {
        impl: OperationImpl<C>;
        precedence?: number;
      };
      this.operations.set(name, {
        impl,
        precedence: precedence ?? 0,
      });
    }
    return this;
  }

  /**
   * Build the engine - validates that all custom operations are registered
   */
  build(): Engine<C> {
    // Check that all declared operations are registered
    const missingOperations: string[] = [];

    for (const opName of this.config.operations) {
      if (!this.builtinOps.has(opName) && !this.operations.has(opName)) {
        missingOperations.push(opName);
      }
    }

    if (missingOperations.length > 0) {
      const operationList = missingOperations.map((op) => `"${op}"`).join(", ");
      throw new Error(
        `Cannot build engine: Custom operations ${operationList} must be registered. ` +
          `Use .withOperation() or .withOperations() to register them.`
      );
    }

    // Create engine with pre-populated operations
    const engine = createEngine(this.config, { strictOperations: false });

    // Transfer our registered operations to the engine
    for (const [name, info] of this.operations) {
      if (!this.builtinOps.has(name)) {
        engine.registerOperation?.(name, info.impl, {
          precedence: info.precedence,
        });
      }
    }

    return engine;
  }
}

/**
 * Create a type-safe engine builder that enforces operation registration
 */
export function createEngineBuilder<const C extends ConfigSpec>(
  config: C
): EngineBuilder<C> {
  return new EngineBuilder(config);
}
