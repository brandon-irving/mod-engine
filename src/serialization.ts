import type {
  ConfigSpec,
  ItemSpec,
  Modifier,
  SerializedData,
  EvaluationResult,
} from "./types.js";
import { SerializationError } from "./errors.js";

/**
 * Current serialization version
 */
const CURRENT_VERSION = 1;

/**
 * Serializes an item specification to JSON-compatible format
 */
export function serializeItem<C extends ConfigSpec>(
  item: ItemSpec<C>
): SerializedData<ItemSpec<C>> {
  try {
    const data: ItemSpec<C> =
      item.name !== undefined
        ? {
            name: item.name,
            attributes: item.attributes,
            modifiers: item.modifiers,
          }
        : {
            attributes: item.attributes,
            modifiers: item.modifiers,
          };

    return {
      version: CURRENT_VERSION,
      data,
    };
  } catch (error) {
    throw new SerializationError(
      `Failed to serialize item: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Deserializes an item specification from JSON-compatible format
 */
export function deserializeItem<C extends ConfigSpec>(
  serialized: SerializedData<ItemSpec<C>>
): ItemSpec<C> {
  try {
    if (!serialized || typeof serialized !== "object") {
      throw new SerializationError("Invalid serialized data: not an object");
    }

    if (!("version" in serialized) || !("data" in serialized)) {
      throw new SerializationError(
        "Invalid serialized data: missing version or data"
      );
    }

    if (serialized.version !== CURRENT_VERSION) {
      throw new SerializationError(
        `Unsupported version ${serialized.version}. Current version: ${CURRENT_VERSION}`
      );
    }

    const data = serialized.data;

    if (!data || typeof data !== "object") {
      throw new SerializationError(
        "Invalid serialized data: data is not an object"
      );
    }

    // Validate required fields
    if (!("attributes" in data) || !("modifiers" in data)) {
      throw new SerializationError(
        "Invalid serialized data: missing attributes or modifiers"
      );
    }

    return data.name !== undefined
      ? {
          name: data.name,
          attributes: data.attributes,
          modifiers: data.modifiers,
        }
      : {
          attributes: data.attributes,
          modifiers: data.modifiers,
        };
  } catch (error) {
    if (error instanceof SerializationError) {
      throw error;
    }
    throw new SerializationError(
      `Failed to deserialize item: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Serializes an array of modifiers to JSON-compatible format
 */
export function serializeModifiers<C extends ConfigSpec>(
  modifiers: readonly Modifier<C>[]
): SerializedData<readonly Modifier<C>[]> {
  try {
    return {
      version: CURRENT_VERSION,
      data: modifiers,
    };
  } catch (error) {
    throw new SerializationError(
      `Failed to serialize modifiers: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Deserializes an array of modifiers from JSON-compatible format
 */
export function deserializeModifiers<C extends ConfigSpec>(
  serialized: SerializedData<readonly Modifier<C>[]>
): readonly Modifier<C>[] {
  try {
    if (!serialized || typeof serialized !== "object") {
      throw new SerializationError("Invalid serialized data: not an object");
    }

    if (!("version" in serialized) || !("data" in serialized)) {
      throw new SerializationError(
        "Invalid serialized data: missing version or data"
      );
    }

    if (serialized.version !== CURRENT_VERSION) {
      throw new SerializationError(
        `Unsupported version ${serialized.version}. Current version: ${CURRENT_VERSION}`
      );
    }

    const data = serialized.data;

    if (!Array.isArray(data)) {
      throw new SerializationError(
        "Invalid serialized data: data is not an array"
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SerializationError) {
      throw error;
    }
    throw new SerializationError(
      `Failed to deserialize modifiers: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Serializes an evaluation result to JSON-compatible format
 */
export function serializeEvaluationResult<C extends ConfigSpec>(
  result: EvaluationResult<C>
): SerializedData<EvaluationResult<C>> {
  try {
    return {
      version: CURRENT_VERSION,
      data: {
        metrics: result.metrics,
        applied: result.applied,
      },
    };
  } catch (error) {
    throw new SerializationError(
      `Failed to serialize evaluation result: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Deserializes an evaluation result from JSON-compatible format
 */
export function deserializeEvaluationResult<C extends ConfigSpec>(
  serialized: SerializedData<EvaluationResult<C>>
): EvaluationResult<C> {
  try {
    if (!serialized || typeof serialized !== "object") {
      throw new SerializationError("Invalid serialized data: not an object");
    }

    if (!("version" in serialized) || !("data" in serialized)) {
      throw new SerializationError(
        "Invalid serialized data: missing version or data"
      );
    }

    if (serialized.version !== CURRENT_VERSION) {
      throw new SerializationError(
        `Unsupported version ${serialized.version}. Current version: ${CURRENT_VERSION}`
      );
    }

    const data = serialized.data;

    if (!data || typeof data !== "object") {
      throw new SerializationError(
        "Invalid serialized data: data is not an object"
      );
    }

    // Validate required fields
    if (!("metrics" in data) || !("applied" in data)) {
      throw new SerializationError(
        "Invalid serialized data: missing metrics or applied"
      );
    }

    return {
      metrics: data.metrics,
      applied: data.applied,
    };
  } catch (error) {
    if (error instanceof SerializationError) {
      throw error;
    }
    throw new SerializationError(
      `Failed to deserialize evaluation result: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Converts data to JSON string with proper error handling
 */
export function toJSON(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new SerializationError(
      `Failed to convert to JSON: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Parses JSON string with proper error handling
 */
export function fromJSON<T>(json: string): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    throw new SerializationError(
      `Failed to parse JSON: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Creates a deep clone of serializable data
 */
export function deepClone<T>(data: T): T {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    throw new SerializationError(
      `Failed to deep clone: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
