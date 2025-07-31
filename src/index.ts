// Core types
export type {
  // Configuration types
  ConfigSpec,
  AttributeSchema,
  EnumAttributeSchema,
  BooleanAttributeSchema,
  NumberAttributeSchema,
  StringAttributeSchema,

  // Data types
  ItemSpec,
  Modifier,
  Condition,
  Stacking,
  Attributes,

  // Result types
  EvaluationResult,
  ModifierApplication,
  ValidationResult,
  ValidationError as ValidationErrorType,

  // Utility types
  MetricOf,
  OperationOf,
  AttrKeyOf,
  AttrValueOf,

  // Function types
  OperationImpl,
  EvalContext,

  // Serialization types
  SerializedData,
} from "./types.js";

// Core functions
export { defineConfig, createEngine } from "./config.js";
export type { Engine } from "./config.js";

// Builder API
export { Builder, createConditionBuilder } from "./builder.js";
export type { ConditionBuilder } from "./builder.js";

// Validation
export { validateItem, validateConfig } from "./validation.js";

// Serialization
export {
  serializeItem,
  deserializeItem,
  serializeModifiers,
  deserializeModifiers,
  serializeEvaluationResult,
  deserializeEvaluationResult,
  toJSON,
  fromJSON,
  deepClone,
} from "./serialization.js";

// Conditions
export { evaluateCondition, validateCondition } from "./conditions.js";

// Operations
export {
  sumOperation,
  subtractOperation,
  multiplyOperation,
  createBuiltInOperations,
  validateNumericResult,
} from "./operations.js";
export type { OperationInfo } from "./operations.js";

// Evaluation
export {
  evaluateItem,
  createMetricsSnapshot,
  validateMetricsCompleteness,
} from "./evaluation.js";

// Explain helper
export { explainEvaluation } from "./explain.js";

// Errors
export {
  ModEngineError,
  SchemaError,
  ValidationError,
  OperationError,
  ConditionError,
  EvaluationError,
  SerializationError,
} from "./errors.js";
