// Core types
export type {
  Attributes,
  AttributeSchema,
  AttrKeyOf,
  AttrValueOf,
  BooleanAttributeSchema,
  Condition,
  // Configuration types
  ConfigSpec,
  EnumAttributeSchema,
  EvalContext,
  // Result types
  EvaluationResult,
  // Data types
  ItemSpec,
  // Utility types
  MetricOf,
  Modifier,
  ModifierApplication,
  NumberAttributeSchema,
  // Function types
  OperationImpl,
  OperationOf,
  // Serialization types
  SerializedData,
  Stacking,
  StringAttributeSchema,
  ValidationError as ValidationErrorType,
  ValidationResult,
} from "./types";

// Core functions
export { createEngine, defineConfig } from "./config";
export type { Engine } from "./config";

// Engine Builder (enforces operation registration)
export { createEngineBuilder, EngineBuilder } from "./engine-builder";

// Builder API
export { Builder, createConditionBuilder } from "./builder";
export type { ConditionBuilder } from "./builder";

// Validation
export { validateConfig, validateItem, validateOperations } from "./validation";

// Serialization
export {
  deepClone,
  deserializeEvaluationResult,
  deserializeItem,
  deserializeModifiers,
  fromJSON,
  serializeEvaluationResult,
  serializeItem,
  serializeModifiers,
  toJSON,
} from "./serialization";

// Conditions
export { evaluateCondition, validateCondition } from "./conditions";

// Operations
export {
  builtinOps,
  createBuiltInOperations,
  multiplyOperation,
  subtractOperation,
  sumOperation,
  validateNumericResult,
} from "./operations";
export type { BuiltinOperation, OperationInfo } from "./operations";

// Evaluation
export {
  createMetricsSnapshot,
  evaluateItem,
  validateMetricsCompleteness,
} from "./evaluation";

// Explain helper
export { explainEvaluation } from "./explain";

// Snapshot helper
export { toSnapshot } from "./snapshot";

// Errors
export {
  ConditionError,
  EvaluationError,
  ModEngineError,
  OperationError,
  SchemaError,
  SerializationError,
  ValidationError,
} from "./errors";
