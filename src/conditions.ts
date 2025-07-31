import type { ConfigSpec, Condition, Attributes } from "./types.js";
import { ConditionError } from "./errors.js";

/**
 * Evaluates a condition against the given attributes
 */
export function evaluateCondition<C extends ConfigSpec>(
  condition: Condition<C>,
  attributes: Attributes<C>,
  path = "condition"
): boolean {
  try {
    switch (condition.op) {
      case "and":
        return condition.clauses.every((clause, index) =>
          evaluateCondition(clause, attributes, `${path}.clauses[${index}]`)
        );

      case "or":
        return condition.clauses.some((clause, index) =>
          evaluateCondition(clause, attributes, `${path}.clauses[${index}]`)
        );

      case "not":
        return !evaluateCondition(
          condition.clause,
          attributes,
          `${path}.clause`
        );

      case "eq":
        return evaluateEquality(
          condition.attr,
          condition.value,
          attributes,
          path
        );

      case "in":
        return evaluateInclusion(
          condition.attr,
          condition.values,
          attributes,
          path
        );

      case "includes":
        return evaluateContains(
          condition.attr,
          condition.value,
          attributes,
          path
        );

      case "gt":
        return evaluateComparison(
          condition.attr,
          condition.value,
          attributes,
          path,
          (a, b) => a > b
        );

      case "gte":
        return evaluateComparison(
          condition.attr,
          condition.value,
          attributes,
          path,
          (a, b) => a >= b
        );

      case "lt":
        return evaluateComparison(
          condition.attr,
          condition.value,
          attributes,
          path,
          (a, b) => a < b
        );

      case "lte":
        return evaluateComparison(
          condition.attr,
          condition.value,
          attributes,
          path,
          (a, b) => a <= b
        );

      default:
        throw new ConditionError(
          `Unknown condition operation: ${(condition as any).op}`,
          path
        );
    }
  } catch (error) {
    if (error instanceof ConditionError) {
      throw error;
    }
    throw new ConditionError(
      `Condition evaluation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
      path
    );
  }
}

/**
 * Evaluates equality condition
 */
function evaluateEquality<C extends ConfigSpec>(
  attr: string,
  value: unknown,
  attributes: Attributes<C>,
  _path: string
): boolean {
  const attrValue = attributes[attr as keyof Attributes<C>];

  if (attrValue === undefined) {
    return false;
  }

  // For arrays (multi-enum), check if they contain exactly the same elements
  if (Array.isArray(attrValue) && Array.isArray(value)) {
    if (attrValue.length !== value.length) {
      return false;
    }
    return attrValue.every((item, index) => item === value[index]);
  }

  return attrValue === value;
}

/**
 * Evaluates inclusion condition (value is in array)
 */
function evaluateInclusion<C extends ConfigSpec>(
  attr: string,
  values: readonly unknown[],
  attributes: Attributes<C>,
  _path: string
): boolean {
  const attrValue = attributes[attr as keyof Attributes<C>];

  if (attrValue === undefined) {
    return false;
  }

  return values.includes(attrValue);
}

/**
 * Evaluates contains condition (array contains value)
 */
function evaluateContains<C extends ConfigSpec>(
  attr: string,
  value: unknown,
  attributes: Attributes<C>,
  path: string
): boolean {
  const attrValue = attributes[attr as keyof Attributes<C>];

  if (attrValue === undefined) {
    return false;
  }

  if (!Array.isArray(attrValue)) {
    throw new ConditionError(
      `Attribute '${attr}' is not an array for 'includes' operation`,
      path
    );
  }

  return attrValue.includes(value);
}

/**
 * Evaluates numeric comparison condition
 */
function evaluateComparison<C extends ConfigSpec>(
  attr: string,
  value: number,
  attributes: Attributes<C>,
  path: string,
  compareFn: (a: number, b: number) => boolean
): boolean {
  const attrValue = attributes[attr as keyof Attributes<C>];

  if (attrValue === undefined) {
    return false;
  }

  if (typeof attrValue !== "number") {
    throw new ConditionError(
      `Attribute '${attr}' is not a number for comparison operation`,
      path
    );
  }

  return compareFn(attrValue, value);
}

/**
 * Validates that a condition is well-formed
 */
export function validateCondition<C extends ConfigSpec>(
  condition: Condition<C>,
  config: C,
  path = "condition"
): void {
  try {
    switch (condition.op) {
      case "and":
      case "or":
        if (
          !Array.isArray(condition.clauses) ||
          condition.clauses.length === 0
        ) {
          throw new ConditionError(
            `${condition.op} condition must have non-empty clauses array`,
            path
          );
        }
        condition.clauses.forEach((clause, index) =>
          validateCondition(clause, config, `${path}.clauses[${index}]`)
        );
        break;

      case "not":
        validateCondition(condition.clause, config, `${path}.clause`);
        break;

      case "eq":
      case "includes":
        validateAttributeReference(condition.attr, config, path);
        break;

      case "in":
        validateAttributeReference(condition.attr, config, path);
        if (!Array.isArray(condition.values) || condition.values.length === 0) {
          throw new ConditionError(
            `'in' condition must have non-empty values array`,
            path
          );
        }
        break;

      case "gt":
      case "gte":
      case "lt":
      case "lte":
        validateAttributeReference(condition.attr, config, path);
        if (typeof condition.value !== "number") {
          throw new ConditionError(
            `Comparison conditions require numeric value`,
            path
          );
        }
        break;

      default:
        throw new ConditionError(
          `Unknown condition operation: ${(condition as any).op}`,
          path
        );
    }
  } catch (error) {
    if (error instanceof ConditionError) {
      throw error;
    }
    throw new ConditionError(
      `Condition validation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
      path
    );
  }
}

/**
 * Validates that an attribute reference is valid
 */
function validateAttributeReference<C extends ConfigSpec>(
  attr: string,
  config: C,
  path: string
): void {
  const validAttrs = config.attributes.map((a) => a.key);
  if (!validAttrs.includes(attr)) {
    throw new ConditionError(
      `Unknown attribute '${attr}'. Valid attributes: ${validAttrs.join(", ")}`,
      path
    );
  }
}
