/**
 * Base error class for all mod engine errors
 */
export abstract class ModEngineError extends Error {
  public readonly code: string;
  public readonly path: string | undefined;

  constructor(message: string, code: string, path?: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.path = path;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (
      "captureStackTrace" in Error &&
      typeof Error.captureStackTrace === "function"
    ) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when schema configuration is invalid
 */
export class SchemaError extends ModEngineError {
  constructor(message: string, path?: string) {
    super(message, "SCHEMA_ERROR", path);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends ModEngineError {
  constructor(message: string, path?: string) {
    super(message, "VALIDATION_ERROR", path);
  }
}

/**
 * Error thrown when an operation fails
 */
export class OperationError extends ModEngineError {
  constructor(message: string, path?: string) {
    super(message, "OPERATION_ERROR", path);
  }
}

/**
 * Error thrown when condition evaluation fails
 */
export class ConditionError extends ModEngineError {
  constructor(message: string, path?: string) {
    super(message, "CONDITION_ERROR", path);
  }
}

/**
 * Error thrown when evaluation fails
 */
export class EvaluationError extends ModEngineError {
  constructor(message: string, path?: string) {
    super(message, "EVALUATION_ERROR", path);
  }
}

/**
 * Error thrown when serialization/deserialization fails
 */
export class SerializationError extends ModEngineError {
  constructor(message: string, path?: string) {
    super(message, "SERIALIZATION_ERROR", path);
  }
}
