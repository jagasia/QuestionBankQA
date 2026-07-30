/**
 * Canonical field keys used by template mapping definitions.
 */
export type CanonicalFieldKey =
  | "question"
  | "optionA"
  | "optionB"
  | "optionC"
  | "optionD"
  | "correctAnswer"
  | "explanation";

/**
 * Profile describing how a client Excel template maps to canonical fields.
 */
export interface TemplateProfile {
  /** Original column names found in the client template. */
  originalColumnNames: string[];

  /** Mapping from canonical field keys to original client column names. */
  canonicalMapping: Partial<Record<CanonicalFieldKey, string>>;

  /** Original columns that were not mapped to canonical fields. */
  unmappedColumns: string[];

  /** Template profile version identifier. */
  version: string;

  /** Confidence score reserved for future AI-assisted mapping. */
  confidenceScore: number;
}
