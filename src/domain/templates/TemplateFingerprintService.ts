import { createHash } from "node:crypto";
import { ColumnMapping } from "./ColumnMapping";

/**
 * Stateless domain service that generates deterministic template fingerprints
 * from approved column mappings.
 *
 * This service normalizes mapping data and enforces deterministic ordering so
 * logically identical templates always produce the same fingerprint.
 */
export class TemplateFingerprintService {
  /**
   * Generates a deterministic SHA-256 fingerprint for the provided mappings.
   *
   * Normalization removes casing and surrounding-whitespace differences, while
   * deterministic ordering removes input-order differences.
   *
   * As a result, logically identical templates produce the same fingerprint
   * even when their source mapping arrays arrive in different forms.
   */
  public generateFingerprint(mappings: readonly ColumnMapping[]): string {
    this.validateMappings(mappings);

    const canonicalRepresentation = this.buildCanonicalRepresentation(mappings);

    return createHash("sha256")
      .update(canonicalRepresentation, "utf8")
      .digest("hex");
  }

  private buildCanonicalRepresentation(mappings: readonly ColumnMapping[]): string {
    const normalizedMappings = mappings
      .map((mapping, index) => this.normalizeMapping(mapping, index))
      .sort((left, right) => {
        if (left.sourceColumn !== right.sourceColumn) {
          return left.sourceColumn.localeCompare(right.sourceColumn);
        }

        return left.canonicalField.localeCompare(right.canonicalField);
      });

    return normalizedMappings
      .map((mapping) => `${mapping.sourceColumn}->${mapping.canonicalField}`)
      .join("|");
  }

  private validateMappings(mappings: readonly ColumnMapping[]): void {
    if (mappings === null || mappings === undefined) {
      throw new Error(
        "Invalid TemplateFingerprintService input: mappings cannot be null or undefined.",
      );
    }

    if (mappings.length === 0) {
      throw new Error(
        "Invalid TemplateFingerprintService input: mappings must contain at least one ColumnMapping.",
      );
    }
  }

  private normalizeMapping(mapping: ColumnMapping, index: number): {
    sourceColumn: string;
    canonicalField: string;
  } {
    if (mapping === null || mapping === undefined) {
      throw new Error(
        `Invalid TemplateFingerprintService input: mappings[${index}] cannot be null or undefined.`,
      );
    }

    // ColumnMapping currently exposes source and canonical names as domain fields.
    // This preserves the existing domain contract without introducing new state.
    const sourceColumn = mapping.sourceColumn;
    const canonicalField = mapping.canonicalField;

    if (typeof sourceColumn !== "string") {
      throw new Error(
        `Invalid TemplateFingerprintService input: mappings[${index}].sourceColumn must be a string.`,
      );
    }

    if (typeof canonicalField !== "string") {
      throw new Error(
        `Invalid TemplateFingerprintService input: mappings[${index}].canonicalField must be a string.`,
      );
    }

    const normalizedSourceColumn = sourceColumn.trim().toLowerCase();
    const normalizedCanonicalField = canonicalField.trim().toLowerCase();

    if (normalizedSourceColumn.length === 0) {
      throw new Error(
        `Invalid TemplateFingerprintService input: mappings[${index}].sourceColumn cannot be empty.`,
      );
    }

    if (normalizedCanonicalField.length === 0) {
      throw new Error(
        `Invalid TemplateFingerprintService input: mappings[${index}].canonicalField cannot be empty.`,
      );
    }

    return {
      sourceColumn: normalizedSourceColumn,
      canonicalField: normalizedCanonicalField,
    };
  }
}