import type { ConfigSpec, OperationImpl } from "./types.js";

/**
 * Union type of all built-in operations
 */
export type BuiltinOperation = "sum" | "subtract" | "multiply";

/**
 * Helper function to create a typed array of built-in operations
 * Provides autocomplete and type safety for operation selection
 */
export function builtinOps<T extends BuiltinOperation[]>(...operations: T): T {
  return operations;
}

/**
 * Built-in operation: sum
 * Adds the modifier value to the current metric value
 */
export function sumOperation<C extends ConfigSpec>(): OperationImpl<C> {
  return (current: number, value: number) => current + value;
}

/**
 * Built-in operation: subtract
 * Subtracts the modifier value from the current metric value
 */
export function subtractOperation<C extends ConfigSpec>(): OperationImpl<C> {
  return (current: number, value: number) => current - value;
}

/**
 * Built-in operation: multiply
 * Multiplies the current metric value by the modifier value
 */
export function multiplyOperation<C extends ConfigSpec>(): OperationImpl<C> {
  return (current: number, value: number) => current * value;
}

/**
 * Registry of built-in operations with their precedence values
 */
export interface OperationInfo<C extends ConfigSpec> {
  impl: OperationImpl<C>;
  precedence: number;
}

/**
 * Creates a map of built-in operations
 */
export function createBuiltInOperations<C extends ConfigSpec>(): Map<
  string,
  OperationInfo<C>
> {
  const operations = new Map<string, OperationInfo<C>>();

  // Sum and subtract have lower precedence (applied first)
  operations.set("sum", {
    impl: sumOperation<C>(),
    precedence: 10,
  });

  operations.set("subtract", {
    impl: subtractOperation<C>(),
    precedence: 10,
  });

  // Multiply has higher precedence (applied after additive operations)
  operations.set("multiply", {
    impl: multiplyOperation<C>(),
    precedence: 20,
  });

  return operations;
}

/**
 * Validates that a numeric result is safe (not NaN, Infinity, etc.)
 */
export function validateNumericResult(value: number, path: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric result at ${path}: ${value}`);
  }
  return value;
}
