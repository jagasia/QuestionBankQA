/**
 * Properties required to construct an immutable ImportStatistics value object.
 */
export interface ImportStatisticsProps {
  questionsImported: number;
  questionsSkipped: number;
  warningCount: number;
  errorCount: number;
  processingDuration: number;
}

/**
 * Represents an immutable outcome snapshot for a single import operation.
 *
 * ImportStatistics is a Value Object owned by ImportJob and has no identity.
 */
export class ImportStatistics {
  /** Number of questions successfully imported. */
  public readonly questionsImported: number;

  /** Number of questions skipped during import. */
  public readonly questionsSkipped: number;

  /** Number of business warnings produced by the import. */
  public readonly warningCount: number;

  /** Number of business errors produced by the import. */
  public readonly errorCount: number;

  /** Total processing duration in milliseconds. */
  public readonly processingDuration: number;

  /**
   * Creates a new immutable ImportStatistics value object.
   */
  constructor(props: ImportStatisticsProps) {
    this.validate(props);

    this.questionsImported = props.questionsImported;
    this.questionsSkipped = props.questionsSkipped;
    this.warningCount = props.warningCount;
    this.errorCount = props.errorCount;
    this.processingDuration = props.processingDuration;

    Object.freeze(this);
  }

  /**
   * Returns the total number of processed questions.
   */
  public getTotalProcessed(): number {
    return this.questionsImported + this.questionsSkipped;
  }

  /**
   * Returns true when at least one warning exists.
   */
  public hasWarnings(): boolean {
    return this.warningCount > 0;
  }

  /**
   * Returns true when at least one error exists.
   */
  public hasErrors(): boolean {
    return this.errorCount > 0;
  }

  /**
   * Returns true when the import completed without errors.
   */
  public isSuccessful(): boolean {
    return this.errorCount === 0;
  }

  /**
   * Returns true when at least one question was processed.
   */
  public hasProcessedQuestions(): boolean {
    return this.getTotalProcessed() > 0;
  }

  /**
   * Returns processing duration in milliseconds.
   */
  public getProcessingDuration(): number {
    return this.processingDuration;
  }

  /**
   * Returns true when no questions were processed.
   */
  public isEmpty(): boolean {
    return this.getTotalProcessed() === 0;
  }

  /**
   * Returns the success ratio as questionsImported / totalProcessed.
   *
   * Returns 1 when no questions were processed.
   */
  public getSuccessRate(): number {
    const totalProcessed = this.getTotalProcessed();

    if (totalProcessed === 0) {
      return 1;
    }

    return this.questionsImported / totalProcessed;
  }

  /**
   * Returns true when every property has the same value.
   */
  public equals(other: ImportStatistics): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    return (
      this.questionsImported === other.questionsImported
      && this.questionsSkipped === other.questionsSkipped
      && this.warningCount === other.warningCount
      && this.errorCount === other.errorCount
      && this.processingDuration === other.processingDuration
    );
  }

  private validate(props: ImportStatisticsProps): void {
    if (props === null || props === undefined) {
      throw new Error(
        "Invalid ImportStatistics: props cannot be null or undefined.",
      );
    }

    this.validateNonNegativeInteger(props.questionsImported, "questionsImported");
    this.validateNonNegativeInteger(props.questionsSkipped, "questionsSkipped");
    this.validateNonNegativeInteger(props.warningCount, "warningCount");
    this.validateNonNegativeInteger(props.errorCount, "errorCount");
    this.validateNonNegativeInteger(props.processingDuration, "processingDuration");
  }

  private validateNonNegativeInteger(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(
        `Invalid ImportStatistics: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error(
        `Invalid ImportStatistics: ${fieldName} must be a number.`,
      );
    }

    if (!Number.isInteger(value)) {
      throw new Error(
        `Invalid ImportStatistics: ${fieldName} must be an integer.`,
      );
    }

    if (value < 0) {
      throw new Error(
        `Invalid ImportStatistics: ${fieldName} must be greater than or equal to 0.`,
      );
    }
  }
}