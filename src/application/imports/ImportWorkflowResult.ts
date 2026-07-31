import { ImportJob } from "../../domain/imports/ImportJob";
import { TemplateDetectionResult } from "../../domain/templates/TemplateDetectionResult";

/**
 * Properties required to construct an immutable ImportWorkflowResult.
 */
export interface ImportWorkflowResultProps {
  importJob: ImportJob;
  templateDetectionResult: TemplateDetectionResult;
  fingerprint: string;
  processingTimestamp: Date;
}

/**
 * Immutable application result returned by the import workflow.
 */
export class ImportWorkflowResult {
  /** Import job produced by the workflow. */
  public readonly importJob: ImportJob;

  /** Template detection outcome produced by the workflow. */
  public readonly templateDetectionResult: TemplateDetectionResult;

  /** Deterministic fingerprint computed from the workbook mappings. */
  public readonly fingerprint: string;

  private readonly processingTimestampValue: Date;

  /**
   * Creates a new immutable ImportWorkflowResult.
   */
  constructor(props: ImportWorkflowResultProps) {
    this.validate(props);

    this.importJob = props.importJob;
    this.templateDetectionResult = props.templateDetectionResult;
    this.fingerprint = props.fingerprint;
    this.processingTimestampValue = new Date(props.processingTimestamp.getTime());

    Object.freeze(this);
  }

  /**
   * Returns the workflow processing timestamp as a defensive copy.
   */
  public getProcessingTimestamp(): Date {
    return new Date(this.processingTimestampValue.getTime());
  }

  /**
   * Validates all workflow result properties before assignment.
   */
  private validate(props: ImportWorkflowResultProps): void {
    if (props === null || props === undefined) {
      throw new Error(
        "Invalid ImportWorkflowResult: props cannot be null or undefined.",
      );
    }

    if (props.importJob === null || props.importJob === undefined) {
      throw new Error(
        "Invalid ImportWorkflowResult: importJob cannot be null or undefined.",
      );
    }

    if (
      props.templateDetectionResult === null ||
      props.templateDetectionResult === undefined
    ) {
      throw new Error(
        "Invalid ImportWorkflowResult: templateDetectionResult cannot be null or undefined.",
      );
    }

    this.validateNonEmptyString(props.fingerprint, "fingerprint");

    if (
      !(props.processingTimestamp instanceof Date) ||
      Number.isNaN(props.processingTimestamp.getTime())
    ) {
      throw new Error(
        "Invalid ImportWorkflowResult: processingTimestamp must be a valid Date.",
      );
    }
  }

  /**
   * Validates that a required string input is present and non-empty.
   */
  private validateNonEmptyString(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(
        `Invalid ImportWorkflowResult: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(
        `Invalid ImportWorkflowResult: ${fieldName} must be a string.`,
      );
    }

    if (value.trim().length === 0) {
      throw new Error(
        `Invalid ImportWorkflowResult: ${fieldName} cannot be empty.`,
      );
    }
  }
}
