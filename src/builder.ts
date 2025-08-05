import { ValidationError } from "./errors";
import { deepClone } from "./serialization";
import type {
  Attributes,
  AttrKeyOf,
  AttrValueOf,
  Condition,
  ConfigSpec,
  ItemSpec,
  MetricOf,
  Modifier,
  OperationOf,
  Stacking,
} from "./types";

/**
 * Fluent builder for creating item specifications
 */
export class Builder<C extends ConfigSpec> {
  private itemName?: string;
  private attributes: Record<string, unknown> = {};
  private modifiers: Array<{
    metric: string;
    operation: string;
    value: number;
    conditions?: Condition<C>;
    stacking?: Stacking;
    priority?: number;
    source?: string;
  }> = [];
  private currentCondition?: Condition<C>;
  private currentStacking?: Stacking;
  private currentPriority?: number;
  private currentSource?: string;

  // Tracks nested group depth to manage context scoping
  private groupDepth = 0;
  constructor(private config: C, name?: string) {
    this.itemName = name;
  }

  /**
   * Sets an attribute value with type safety
   */
  set<K extends AttrKeyOf<C>>(key: K, value: AttrValueOf<C, K>): Builder<C> {
    this.attributes[key as string] = value;
    return this;
  }

  /**
   * Sets a condition for subsequent modifiers
   */
  when(condition: Condition<C>): Builder<C> {
    this.currentCondition = condition;
    return this;
  }

  /**
   * Sets metadata for subsequent modifiers
   */
  with(metadata: {
    stacking?: Stacking;
    priority?: number;
    source?: string;
  }): Builder<C> {
    if (metadata.stacking !== undefined) {
      this.currentStacking = metadata.stacking;
    }
    if (metadata.priority !== undefined) {
      this.currentPriority = metadata.priority;
    }
    if (metadata.source !== undefined) {
      this.currentSource = metadata.source;
    }
    return this;
  }

  /**
   * Adds an increase modifier (sum operation)
   */
  increase<M extends MetricOf<C>>(
    metric: M
  ): {
    by(value: number): Builder<C>;
  } {
    return {
      by: (value: number) =>
        this.addModifier(metric, "sum" as OperationOf<C>, value),
    };
  }

  /**
   * Adds a decrease modifier (subtract operation)
   */
  decrease<M extends MetricOf<C>>(
    metric: M
  ): {
    by(value: number): Builder<C>;
  } {
    return {
      by: (value: number) =>
        this.addModifier(metric, "subtract" as OperationOf<C>, value),
    };
  }

  /**
   * Adds a multiply modifier
   */
  multiply<M extends MetricOf<C>>(
    metric: M
  ): {
    by(value: number): Builder<C>;
  } {
    return {
      by: (value: number) =>
        this.addModifier(metric, "multiply" as OperationOf<C>, value),
    };
  }

  /**
   * Adds a generic modifier with specified operation
   */
  apply<M extends MetricOf<C>, O extends OperationOf<C>>(
    metric: M,
    operation: O
  ): {
    by(value: number): Builder<C>;
  } {
    return {
      by: (value: number) => this.addModifier(metric, operation, value),
    };
  }

  /**
   * Internal method to add a modifier
   */
  private addModifier<M extends MetricOf<C>, O extends OperationOf<C>>(
    metric: M,
    operation: O,
    value: number
  ): Builder<C> {
    // Validate metric
    if (!this.config.metrics.includes(metric as string)) {
      throw new ValidationError(`Unknown metric: ${metric}`);
    }

    // Validate operation
    if (!this.config.operations.includes(operation as string)) {
      throw new ValidationError(`Unknown operation: ${operation}`);
    }

    // Validate value
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new ValidationError(
        `Modifier value must be a finite number, got: ${value}`
      );
    }

    const modifier = {
      metric: metric as string,
      operation: operation as string,
      value,
      ...(this.currentCondition && { conditions: this.currentCondition }),
      ...(this.currentStacking && { stacking: this.currentStacking }),
      ...(this.currentPriority !== undefined && {
        priority: this.currentPriority,
      }),
      ...(this.currentSource && { source: this.currentSource }),
    };

    this.modifiers.push(modifier);

    // Reset current context after applying modifier
    this.resetCurrentContext();

    return this;
  }

  /**
   * Resets the current context (condition, stacking, etc.)
   */
  private resetCurrentContext(): void {
    if (this.groupDepth > 0) {
      // Within a group, defer resetting. The group lifecycle will restore
      // the previous context after the callback completes.
      return;
    }
    this.currentCondition = undefined;
    this.currentStacking = undefined;
    this.currentPriority = undefined;
    this.currentSource = undefined;
  }

  /**
   * Clears any pending condition so subsequent modifiers are unaffected.
   */
  clearConditions(): Builder<C> {
    this.currentCondition = undefined;
    return this;
  }

  /**
   * Clears stacking / priority / source metadata applied to subsequent modifiers.
   */
  clearMeta(): Builder<C> {
    this.currentStacking = undefined;
    this.currentPriority = undefined;
    this.currentSource = undefined;
    return this;
  }

  /**
   * Creates a temporary grouping context where the provided condition/meta apply
   * to all modifiers executed within the callback. After the callback the
   * previous context is restored automatically.
   */
  group(
    options: {
      when?: Condition<C>;
      with?: { stacking?: Stacking; priority?: number; source?: string };
    },
    fn: (b: Builder<C>) => void
  ): Builder<C> {
    // Save previous context
    const prevCondition = this.currentCondition;
    const prevStacking = this.currentStacking;
    const prevPriority = this.currentPriority;
    const prevSource = this.currentSource;

    // Apply new context
    if (options.when) {
      this.currentCondition = options.when;
    }
    if (options.with) {
      if (options.with.stacking !== undefined)
        this.currentStacking = options.with.stacking;
      if (options.with.priority !== undefined)
        this.currentPriority = options.with.priority;
      if (options.with.source !== undefined)
        this.currentSource = options.with.source;
    }

    // Mark that we're inside a group so addModifier will not reset context after each call
    this.groupDepth++;
    try {
      fn(this);
    } finally {
      // Restore previous context regardless of callback outcome
      this.groupDepth--;
      this.currentCondition = prevCondition;
      this.currentStacking = prevStacking;
      this.currentPriority = prevPriority;
      this.currentSource = prevSource;
    }

    return this;
  }

  /**
   * Builds and returns the immutable item specification
   */
  build(): ItemSpec<C> {
    const result: { name?: string } & Pick<
      ItemSpec<C>,
      "attributes" | "modifiers"
    > = {
      attributes: this.attributes as Attributes<C>,
      modifiers: this.modifiers as Modifier<C>[],
    };

    if (this.itemName !== undefined) {
      result.name = this.itemName;
    }

    return result;
  }

  /**
   * Creates a copy of the builder with the same state
   */
  clone(): Builder<C> {
    const cloned = new Builder(this.config, this.itemName);
    cloned.attributes = deepClone(this.attributes);
    cloned.modifiers = deepClone(this.modifiers);
    cloned.currentCondition = this.currentCondition;
    cloned.currentStacking = this.currentStacking;
    cloned.currentPriority = this.currentPriority;
    cloned.currentSource = this.currentSource;
    return cloned;
  }

  /**
   * Gets the current number of modifiers
   */
  get modifierCount(): number {
    return this.modifiers.length;
  }

  /**
   * Gets the current number of attributes set
   */
  get attributeCount(): number {
    return Object.keys(this.attributes).length;
  }

  /**
   * Clears all modifiers
   */
  clearModifiers(): Builder<C> {
    this.modifiers = [];
    this.resetCurrentContext();
    return this;
  }

  /**
   * Clears all attributes
   */
  clearAttributes(): Builder<C> {
    this.attributes = {};
    return this;
  }

  /**
   * Resets the builder to initial state
   */
  reset(): Builder<C> {
    this.attributes = {};
    this.modifiers = [];
    this.resetCurrentContext();
    return this;
  }
}

/**
 * Helper type for condition builders
 */
export interface ConditionBuilder<C extends ConfigSpec> {
  /**
   * Creates an equality condition
   */
  eq<K extends AttrKeyOf<C>>(attr: K, value: AttrValueOf<C, K>): Condition<C>;

  /**
   * Creates an inclusion condition (value in array)
   */
  in<K extends AttrKeyOf<C>>(
    attr: K,
    values: AttrValueOf<C, K>[]
  ): Condition<C>;

  /**
   * Creates a contains condition (array contains value)
   */
  includes<K extends AttrKeyOf<C>>(
    attr: K,
    value: AttrValueOf<C, K>
  ): Condition<C>;

  /**
   * Creates comparison conditions
   */
  gt(attr: AttrKeyOf<C>, value: number): Condition<C>;
  gte(attr: AttrKeyOf<C>, value: number): Condition<C>;
  lt(attr: AttrKeyOf<C>, value: number): Condition<C>;
  lte(attr: AttrKeyOf<C>, value: number): Condition<C>;

  /**
   * Creates logical conditions
   */
  and(...conditions: Condition<C>[]): Condition<C>;
  or(...conditions: Condition<C>[]): Condition<C>;
  not(condition: Condition<C>): Condition<C>;
}

/**
 * Creates a condition builder for type-safe condition construction
 */
export function createConditionBuilder<
  C extends ConfigSpec
>(): ConditionBuilder<C> {
  return {
    eq: <K extends AttrKeyOf<C>>(
      attr: K,
      value: AttrValueOf<C, K>
    ): Condition<C> =>
      ({
        op: "eq",
        attr,
        value,
      } as unknown as Condition<C>),

    in: <K extends AttrKeyOf<C>>(
      attr: K,
      values: AttrValueOf<C, K>[]
    ): Condition<C> =>
      ({
        op: "in",
        attr,
        values,
      } as unknown as Condition<C>),

    includes: <K extends AttrKeyOf<C>>(
      attr: K,
      value: AttrValueOf<C, K>
    ): Condition<C> =>
      ({
        op: "includes",
        attr,
        value,
      } as unknown as Condition<C>),

    gt: (attr: AttrKeyOf<C>, value: number): Condition<C> => ({
      op: "gt",
      attr,
      value,
    }),

    gte: (attr: AttrKeyOf<C>, value: number): Condition<C> => ({
      op: "gte",
      attr,
      value,
    }),

    lt: (attr: AttrKeyOf<C>, value: number): Condition<C> => ({
      op: "lt",
      attr,
      value,
    }),

    lte: (attr: AttrKeyOf<C>, value: number): Condition<C> => ({
      op: "lte",
      attr,
      value,
    }),

    and: (...conditions: Condition<C>[]): Condition<C> => ({
      op: "and",
      clauses: conditions,
    }),

    or: (...conditions: Condition<C>[]): Condition<C> => ({
      op: "or",
      clauses: conditions,
    }),

    not: (condition: Condition<C>): Condition<C> => ({
      op: "not",
      clause: condition,
    }),
  };
}
