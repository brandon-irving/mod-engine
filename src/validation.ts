import type {
  ConfigSpec,
  ItemSpec,
  Modifier,
  ValidationResult,
  ValidationError as ValidationErrorType,
  AttributeSchema,
  EnumAttributeSchema,
  NumberAttributeSchema,
  StringAttributeSchema,
  Attributes,
} from "./types.js";
import { ValidationError, SchemaError } from "./errors.js";
import { validateCondition } from "./conditions.js";
import type { OperationInfo } from "./operations.js";

/**
 * Validates an item specification against the config
 */
export function validateItem<C extends ConfigSpec>(
  item: ItemSpec<C>,
  config: C
): ValidationResult {
  const errors: ValidationErrorType[] = [];

  try {
    // Validate attributes
    validateAttributes(item.attributes, config, errors);

    // Validate modifiers
    validateModifiers(item.modifiers, config, errors);
  } catch (error) {
    if (error instanceof ValidationError) {
      errors.push({
        path: error.path || "item",
        message: error.message,
        code: error.code,
      });
    } else {
      errors.push({
        path: "item",
        message: `Validation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        code: "UNKNOWN_ERROR",
      });
    }
  }

  if (errors.length === 0) {
    return { ok: true };
  }

  return {
    ok: false,
    errors,
  };
}

/**
 * Validates attributes against the schema
 */
function validateAttributes<C extends ConfigSpec>(
  attributes: Attributes<C>,
  config: C,
  errors: ValidationErrorType[]
): void {
  // Check for unknown attributes
  const validAttrKeys = new Set(config.attributes.map((attr) => attr.key));
  for (const key of Object.keys(attributes)) {
    if (!validAttrKeys.has(key)) {
      errors.push({
        path: `attributes.${key}`,
        message: `Unknown attribute '${key}'. Valid attributes: ${Array.from(
          validAttrKeys
        ).join(", ")}`,
        code: "UNKNOWN_ATTRIBUTE",
      });
    }
  }

  // Validate each attribute value
  for (const attrSchema of config.attributes) {
    const value = attributes[attrSchema.key as keyof Attributes<C>];
    if (value !== undefined) {
      validateAttributeValue(
        value,
        attrSchema,
        `attributes.${attrSchema.key}`,
        errors
      );
    }
  }
}

/**
 * Validates a specific attribute value against its schema
 */
function validateAttributeValue(
  value: unknown,
  schema: AttributeSchema,
  path: string,
  errors: ValidationErrorType[]
): void {
  try {
    switch (schema.kind) {
      case "enum":
        validateEnumValue(value, schema, path, errors);
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          errors.push({
            path,
            message: `Expected boolean, got ${typeof value}`,
            code: "INVALID_TYPE",
          });
        }
        break;

      case "number":
        validateNumberValue(value, schema, path, errors);
        break;

      case "string":
        validateStringValue(value, schema, path, errors);
        break;

      default:
        errors.push({
          path,
          message: `Unknown attribute kind: ${(schema as unknown as { kind: string }).kind}`,
          code: "UNKNOWN_ATTRIBUTE_KIND",
        });
    }
  } catch (error) {
    errors.push({
      path,
      message: `Attribute validation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
      code: "VALIDATION_ERROR",
    });
  }
}

/**
 * Validates enum attribute value
 */
function validateEnumValue(
  value: unknown,
  schema: EnumAttributeSchema,
  path: string,
  errors: ValidationErrorType[]
): void {
  const cardinality = schema.cardinality || "single";

  if (cardinality === "single") {
    if (Array.isArray(value)) {
      errors.push({
        path,
        message: `Single-select enum cannot be an array`,
        code: "INVALID_CARDINALITY",
      });
      return;
    }

    if (typeof value !== "string" || !schema.values.includes(value)) {
      errors.push({
        path,
        message: `Invalid enum value '${value}'. Valid values: ${schema.values.join(
          ", "
        )}`,
        code: "INVALID_ENUM_VALUE",
      });
    }
  } else if (cardinality === "multi") {
    if (!Array.isArray(value)) {
      errors.push({
        path,
        message: `Multi-select enum must be an array`,
        code: "INVALID_CARDINALITY",
      });
      return;
    }

    const invalidValues = value.filter((v) => !schema.values.includes(v));
    if (invalidValues.length > 0) {
      errors.push({
        path,
        message: `Invalid enum values: ${invalidValues.join(
          ", "
        )}. Valid values: ${schema.values.join(", ")}`,
        code: "INVALID_ENUM_VALUE",
      });
    }

    // Check for duplicates
    const uniqueValues = new Set(value);
    if (uniqueValues.size !== value.length) {
      errors.push({
        path,
        message: `Multi-select enum contains duplicate values`,
        code: "DUPLICATE_VALUES",
      });
    }
  }
}

/**
 * Validates number attribute value
 */
function validateNumberValue(
  value: unknown,
  schema: NumberAttributeSchema,
  path: string,
  errors: ValidationErrorType[]
): void {
  if (typeof value !== "number") {
    errors.push({
      path,
      message: `Expected number, got ${typeof value}`,
      code: "INVALID_TYPE",
    });
    return;
  }

  if (!Number.isFinite(value)) {
    errors.push({
      path,
      message: `Number must be finite, got ${value}`,
      code: "INVALID_NUMBER",
    });
    return;
  }

  if (schema.integer === true && !Number.isInteger(value)) {
    errors.push({
      path,
      message: `Expected integer, got ${value}`,
      code: "INVALID_INTEGER",
    });
  }

  if (schema.min !== undefined && value < schema.min) {
    errors.push({
      path,
      message: `Value ${value} is below minimum ${schema.min}`,
      code: "VALUE_TOO_LOW",
    });
  }

  if (schema.max !== undefined && value > schema.max) {
    errors.push({
      path,
      message: `Value ${value} is above maximum ${schema.max}`,
      code: "VALUE_TOO_HIGH",
    });
  }
}

/**
 * Validates string attribute value
 */
function validateStringValue(
  value: unknown,
  schema: StringAttributeSchema,
  path: string,
  errors: ValidationErrorType[]
): void {
  if (typeof value !== "string") {
    errors.push({
      path,
      message: `Expected string, got ${typeof value}`,
      code: "INVALID_TYPE",
    });
    return;
  }

  if (schema.minLen !== undefined && value.length < schema.minLen) {
    errors.push({
      path,
      message: `String length ${value.length} is below minimum ${schema.minLen}`,
      code: "STRING_TOO_SHORT",
    });
  }

  if (schema.maxLen !== undefined && value.length > schema.maxLen) {
    errors.push({
      path,
      message: `String length ${value.length} is above maximum ${schema.maxLen}`,
      code: "STRING_TOO_LONG",
    });
  }

  if (schema.pattern !== undefined) {
    try {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push({
          path,
          message: `String '${value}' does not match pattern ${schema.pattern}`,
          code: "PATTERN_MISMATCH",
        });
      }
    } catch {
      errors.push({
        path,
        message: `Invalid regex pattern: ${schema.pattern}`,
        code: "INVALID_PATTERN",
      });
    }
  }
}

/**
 * Validates modifiers array
 */
function validateModifiers<C extends ConfigSpec>(
  modifiers: readonly Modifier<C>[],
  config: C,
  errors: ValidationErrorType[]
): void {
  modifiers.forEach((modifier, index) => {
    validateModifier(modifier, config, `modifiers[${index}]`, errors);
  });
}

/**
 * Validates a single modifier
 */
function validateModifier<C extends ConfigSpec>(
  modifier: Modifier<C>,
  config: C,
  path: string,
  errors: ValidationErrorType[]
): void {
  // Validate metric reference
  if (!config.metrics.includes(modifier.metric as string)) {
    errors.push({
      path: `${path}.metric`,
      message: `Unknown metric '${
        modifier.metric
      }'. Valid metrics: ${config.metrics.join(", ")}`,
      code: "UNKNOWN_METRIC",
    });
  }

  // Validate operation reference
  if (!config.operations.includes(modifier.operation as string)) {
    errors.push({
      path: `${path}.operation`,
      message: `Unknown operation '${
        modifier.operation
      }'. Valid operations: ${config.operations.join(", ")}`,
      code: "UNKNOWN_OPERATION",
    });
  }

  // Validate value is a finite number
  if (typeof modifier.value !== "number" || !Number.isFinite(modifier.value)) {
    errors.push({
      path: `${path}.value`,
      message: `Modifier value must be a finite number, got ${modifier.value}`,
      code: "INVALID_MODIFIER_VALUE",
    });
  }

  // Validate priority if present
  if (
    modifier.priority !== undefined &&
    (typeof modifier.priority !== "number" ||
      !Number.isInteger(modifier.priority))
  ) {
    errors.push({
      path: `${path}.priority`,
      message: `Priority must be an integer, got ${modifier.priority}`,
      code: "INVALID_PRIORITY",
    });
  }

  // Validate conditions if present
  if (modifier.conditions !== undefined) {
    try {
      validateCondition(modifier.conditions, config, `${path}.conditions`);
    } catch (error) {
      errors.push({
        path: `${path}.conditions`,
        message: error instanceof Error ? error.message : String(error),
        code: "INVALID_CONDITION",
      });
    }
  }
}

/**
 * Validates a configuration specification
 */
export function validateConfig<C extends ConfigSpec>(config: C): void {
  // Validate metrics are non-empty and unique
  if (!Array.isArray(config.metrics) || config.metrics.length === 0) {
    throw new SchemaError("Config must have at least one metric");
  }

  const uniqueMetrics = new Set(config.metrics);
  if (uniqueMetrics.size !== config.metrics.length) {
    throw new SchemaError("Metric names must be unique");
  }

  // Validate operations are non-empty and unique
  if (!Array.isArray(config.operations) || config.operations.length === 0) {
    throw new SchemaError("Config must have at least one operation");
  }

  const uniqueOperations = new Set(config.operations);
  if (uniqueOperations.size !== config.operations.length) {
    throw new SchemaError("Operation names must be unique");
  }

  // Validate attributes are unique by key
  if (!Array.isArray(config.attributes)) {
    throw new SchemaError("Config attributes must be an array");
  }

  const attrKeys = new Set();
  for (const attr of config.attributes) {
    if (!attr.key || typeof attr.key !== "string") {
      throw new SchemaError("Attribute must have a valid string key");
    }

    if (attrKeys.has(attr.key)) {
      throw new SchemaError(`Duplicate attribute key: ${attr.key}`);
    }
    attrKeys.add(attr.key);

    validateAttributeSchema(attr);
  }
}

/**
 * Validates an attribute schema
 */
function validateAttributeSchema(schema: AttributeSchema): void {
  switch (schema.kind) {
    case "enum": {
      if (!Array.isArray(schema.values) || schema.values.length === 0) {
        throw new SchemaError(
          `Enum attribute '${schema.key}' must have non-empty values array`
        );
      }

      const uniqueValues = new Set(schema.values);
      if (uniqueValues.size !== schema.values.length) {
        throw new SchemaError(
          `Enum attribute '${schema.key}' has duplicate values`
        );
      }

      if (
        schema.cardinality &&
        !["single", "multi"].includes(schema.cardinality)
      ) {
        throw new SchemaError(
          `Enum attribute '${schema.key}' has invalid cardinality: ${schema.cardinality}`
        );
      }
      break;
    }

    case "number":
      if (
        schema.min !== undefined &&
        schema.max !== undefined &&
        schema.min > schema.max
      ) {
        throw new SchemaError(`Number attribute '${schema.key}' has min > max`);
      }
      break;

    case "string":
      if (
        schema.minLen !== undefined &&
        schema.maxLen !== undefined &&
        schema.minLen > schema.maxLen
      ) {
        throw new SchemaError(
          `String attribute '${schema.key}' has minLen > maxLen`
        );
      }

      if (schema.pattern !== undefined) {
        try {
          new RegExp(schema.pattern);
        } catch {
          throw new SchemaError(
            `String attribute '${schema.key}' has invalid regex pattern: ${schema.pattern}`
          );
        }
      }
      break;

    case "boolean":
      // No additional validation needed for boolean attributes
      break;

    default:
      throw new SchemaError(`Unknown attribute kind: ${(schema as unknown as { kind: string }).kind}`);
  }
}

/**
 * Validates that all operations declared in config have implementations
 */
export function validateOperations<C extends ConfigSpec>(
  config: C,
  operations: Map<string, OperationInfo<C>>
): void {
  const builtinOps = new Set(["sum", "subtract", "multiply"]);
  const missingOperations: string[] = [];

  for (const opName of config.operations) {
    if (!builtinOps.has(opName) && !operations.has(opName)) {
      missingOperations.push(opName);
    }
  }

  if (missingOperations.length > 0) {
    const operationList = missingOperations.map((op) => `"${op}"`).join(", ");
    throw new ValidationError(
      `Custom operations declared but not registered: ${operationList}. ` +
        `Use engine.registerOperation() to register these operations before using the engine.`,
      "MISSING_OPERATIONS"
    );
  }
}
