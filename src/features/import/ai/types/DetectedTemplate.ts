/**
 * AI-detected template details for an imported workbook.
 */
export interface DetectedTemplate {
  /** Human-readable template name inferred by AI. */
  templateName: string;

  /** Mapping of original Excel column names to canonical field names. */
  detectedMappings: Record<string, string>;

  /** Columns that were not mapped to canonical fields. */
  additionalColumns: string[];

  /** Confidence score for the detected template mapping. */
  confidenceScore: number;

  /** Optional reasoning reserved for future AI explanations. */
  reasoning?: string;
}
