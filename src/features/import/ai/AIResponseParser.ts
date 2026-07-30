import { type DetectedTemplate } from "./types/DetectedTemplate";

/**
 * Deserializes raw AI JSON responses into DetectedTemplate objects.
 */
export class AIResponseParser {
  parse(rawResponse: string): DetectedTemplate {
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawResponse);
    } catch {
      throw new Error("Invalid AI response: response is not valid JSON.");
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid AI response: root value must be a JSON object.");
    }

    const response = parsed as {
      templateName?: unknown;
      detectedMappings?: unknown;
      additionalColumns?: unknown;
      confidenceScore?: unknown;
      reasoning?: unknown;
    };

    const templateName = this.requireString(
      response.templateName,
      "templateName",
    );
    const detectedMappings = this.requireStringRecord(
      response.detectedMappings,
      "detectedMappings",
    );
    const additionalColumns = this.requireStringArray(
      response.additionalColumns,
      "additionalColumns",
    );
    const confidenceScore = this.requireFiniteNumber(
      response.confidenceScore,
      "confidenceScore",
    );

    const reasoning = this.optionalString(response.reasoning, "reasoning");

    return {
      templateName,
      detectedMappings,
      additionalColumns,
      confidenceScore,
      reasoning,
    };
  }

  private requireString(value: unknown, fieldName: string): string {
    if (typeof value !== "string") {
      throw new Error(`Invalid AI response: ${fieldName} must be a string.`);
    }

    return value;
  }

  private requireStringRecord(
    value: unknown,
    fieldName: string,
  ): Record<string, string> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(
        `Invalid AI response: ${fieldName} must be an object mapping strings to strings.`,
      );
    }

    const record = value as Record<string, unknown>;
    for (const [key, item] of Object.entries(record)) {
      if (typeof item !== "string") {
        throw new Error(
          `Invalid AI response: ${fieldName}.${key} must be a string.`,
        );
      }
    }

    return record as Record<string, string>;
  }

  private requireStringArray(value: unknown, fieldName: string): string[] {
    if (!Array.isArray(value)) {
      throw new Error(`Invalid AI response: ${fieldName} must be an array of strings.`);
    }

    for (let index = 0; index < value.length; index += 1) {
      if (typeof value[index] !== "string") {
        throw new Error(
          `Invalid AI response: ${fieldName}[${index}] must be a string.`,
        );
      }
    }

    return value;
  }

  private requireFiniteNumber(value: unknown, fieldName: string): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`Invalid AI response: ${fieldName} must be a finite number.`);
    }

    return value;
  }

  private optionalString(value: unknown, fieldName: string): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value !== "string") {
      throw new Error(`Invalid AI response: ${fieldName} must be a string when provided.`);
    }

    return value;
  }
}
