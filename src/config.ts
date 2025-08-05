import { Builder } from "./builder";
import { evaluateItem } from "./evaluation";
import { createBuiltInOperations } from "./operations";
import type {
  ConfigSpec,
  EvaluationResult,
  ItemSpec,
  MetricOf,
  OperationImpl,
  ValidationResult,
} from "./types";
import { validateConfig, validateItem, validateOperations } from "./validation";

/**
 * Defines a configuration and returns it with strong typing
 */
export function defineConfig<const C extends ConfigSpec>(config: C): C {
  validateConfig(config);
  return config;
}

/**
 * Engine interface that provides all core functionality
 */
export interface Engine<C extends ConfigSpec> {
  builder(name?: string): Builder<C>;
  evaluate(
    item: ItemSpec<C>,
    options?: { base?: Partial<Record<MetricOf<C>, number>> }
  ): EvaluationResult<C>;
  validateItem(item: ItemSpec<C>): ValidationResult;
  registerOperation?(
    name: string,
    impl: OperationImpl<C>,
    options?: { precedence?: number }
  ): void;
}

/**
 * Creates an engine instance from a configuration
 */
export function createEngine<const C extends ConfigSpec>(
  config: C,
  options?: { strictOperations?: boolean }
): Engine<C> {
  // Validate the configuration first
  validateConfig(config);

  // Create operations registry with built-ins
  const operations = createBuiltInOperations<C>();

  // Validate that all declared operations have implementations
  if (options?.strictOperations !== false) {
    validateOperations(config, operations);
  }

  const engine: Engine<C> = {
    builder(name?: string): Builder<C> {
      return new Builder(config, name);
    },

    evaluate(
      item: ItemSpec<C>,
      options?: { base?: Partial<Record<MetricOf<C>, number>> }
    ): EvaluationResult<C> {
      return evaluateItem(item, operations, config, options?.base);
    },

    validateItem(item: ItemSpec<C>): ValidationResult {
      return validateItem(item, config);
    },

    registerOperation(
      name: string,
      impl: OperationImpl<C>,
      options?: { precedence?: number }
    ): void {
      operations.set(name, {
        impl,
        precedence: options?.precedence ?? 0,
      });
    },
  };

  return engine;
}
