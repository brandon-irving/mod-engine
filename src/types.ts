// Core configuration types
export interface EnumAttributeSchema {
  readonly key: string;
  readonly kind: "enum";
  readonly values: readonly string[];
  readonly cardinality?: "single" | "multi";
}

export interface BooleanAttributeSchema {
  readonly key: string;
  readonly kind: "boolean";
}

export interface NumberAttributeSchema {
  readonly key: string;
  readonly kind: "number";
  readonly min?: number;
  readonly max?: number;
  readonly integer?: boolean;
}

export interface StringAttributeSchema {
  readonly key: string;
  readonly kind: "string";
  readonly pattern?: string;
  readonly minLen?: number;
  readonly maxLen?: number;
}

export type AttributeSchema =
  | EnumAttributeSchema
  | BooleanAttributeSchema
  | NumberAttributeSchema
  | StringAttributeSchema;

export interface ConfigSpec {
  readonly metrics: readonly string[];
  readonly operations: readonly string[];
  readonly attributes: readonly AttributeSchema[];
}

// Utility types for extracting information from configs
export type MetricOf<C extends ConfigSpec> = C["metrics"][number];
export type OperationOf<C extends ConfigSpec> = C["operations"][number];
export type AttrKeyOf<C extends ConfigSpec> = C["attributes"][number]["key"];

// Helper type to extract a specific attribute schema
type ExtractAttr<C extends ConfigSpec, K extends AttrKeyOf<C>> = Extract<
  C["attributes"][number],
  { key: K }
>;

// Complex type to extract attribute value types
export type AttrValueOf<
  C extends ConfigSpec,
  K extends AttrKeyOf<C>
> = ExtractAttr<C, K> extends EnumAttributeSchema
  ? ExtractAttr<C, K>["cardinality"] extends "multi"
    ? readonly ExtractAttr<C, K>["values"][number][]
    : ExtractAttr<C, K>["values"][number]
  : ExtractAttr<C, K> extends BooleanAttributeSchema
  ? boolean
  : ExtractAttr<C, K> extends NumberAttributeSchema
  ? number
  : ExtractAttr<C, K> extends StringAttributeSchema
  ? string
  : never;

// Attributes map type
export type Attributes<C extends ConfigSpec> = {
  [K in AttrKeyOf<C>]?: AttrValueOf<C, K>;
};

// Condition types
type EqualityCondition<C extends ConfigSpec> = {
  [K in AttrKeyOf<C>]: { op: "eq"; attr: K; value: AttrValueOf<C, K> };
}[AttrKeyOf<C>];

type InclusionCondition<C extends ConfigSpec> = {
  [K in AttrKeyOf<C>]: { op: "in"; attr: K; values: AttrValueOf<C, K>[] };
}[AttrKeyOf<C>];

type ContainsCondition<C extends ConfigSpec> = {
  [K in AttrKeyOf<C>]: { op: "includes"; attr: K; value: AttrValueOf<C, K> };
}[AttrKeyOf<C>];

export type Condition<C extends ConfigSpec> =
  | { op: "and"; clauses: Condition<C>[] }
  | { op: "or"; clauses: Condition<C>[] }
  | { op: "not"; clause: Condition<C> }
  | EqualityCondition<C>
  | InclusionCondition<C>
  | ContainsCondition<C>
  | { op: "gt" | "gte" | "lt" | "lte"; attr: AttrKeyOf<C>; value: number };

// Stacking behavior
export type Stacking = "stack" | "unique" | { uniqueBy: string };

// Modifier definition
export interface Modifier<C extends ConfigSpec> {
  readonly metric: MetricOf<C>;
  readonly operation: OperationOf<C>;
  readonly value: number;
  readonly conditions?: Condition<C>;
  readonly stacking?: Stacking;
  readonly priority?: number;
  readonly source?: string;
}

// Item specification
export interface ItemSpec<C extends ConfigSpec> {
  readonly name?: string;
  readonly attributes: Attributes<C>;
  readonly modifiers: readonly Modifier<C>[];
}

// Detailed trace entry returned by explain()
export interface AppliedTrace<C extends ConfigSpec> {
  metric: MetricOf<C>;
  operation: OperationOf<C>;
  value: number;
  before: number;
  after: number;
  priority?: number;
  source?: string;
  conditionMatched: boolean;
}

// Evaluation result
export interface ModifierApplication<C extends ConfigSpec> {
  readonly modifier: Modifier<C>;
  /** Value of the modifier as provided via Builder.by */
  readonly appliedValue: number;
  /** Metric value before the modifier was applied */
  readonly before: number;
  /** Metric value after applying the modifier */
  readonly after: number;
  /** @deprecated kept for backwards-compat – use after */
  readonly resultingValue: number;
}

export interface EvaluationResult<C extends ConfigSpec> {
  readonly metrics: Record<MetricOf<C>, number>;
  readonly applied: readonly ModifierApplication<C>[];
}

// Operation function signature
export interface EvalContext<C extends ConfigSpec> {
  readonly item: ItemSpec<C>;
  readonly modifier: Modifier<C>;
  readonly currentMetrics: Record<MetricOf<C>, number>;
}

export type OperationImpl<C extends ConfigSpec> = (
  current: number,
  value: number,
  context: EvalContext<C>
) => number;

// Validation result
export interface ValidationError {
  readonly path: string;
  readonly message: string;
  readonly code: string;
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors?: readonly ValidationError[];
}

// Serialization format
export interface SerializedData<T = unknown> {
  readonly version: number;
  readonly data: T;
}
