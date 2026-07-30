/**
 * Internal standard question representation used across the application.
 */
export interface CanonicalQuestion {
  /** The question or stem text. */
  question: string;

  /** First answer option. */
  optionA: string;

  /** Second answer option. */
  optionB: string;

  /** Third answer option. */
  optionC: string;

  /** Fourth answer option. */
  optionD: string;

  /** The expected correct answer value. */
  correctAnswer: string;

  /** Optional explanation for the correct answer. */
  explanation?: string;

  /** System-understood metadata such as difficulty or topic. */
  metadata: Record<string, unknown>;

  /** Client-specific columns preserved without interpretation. */
  customFields: Record<string, unknown>;
}
