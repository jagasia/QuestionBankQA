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
   * Returns the total question volume considered by the import outcome.
   */
  public getTotalProcessed(): number {
    return this.questionsImported + this.questionsSkipped;
  }

  /**
   * Indicates whether the import outcome includes business warnings.
   */
  public hasWarnings(): boolean {
    return this.warningCount > 0;
  }

  /**
   * Indicates whether the import outcome includes business errors.
   */
  public hasErrors(): boolean {
    return this.errorCount > 0;
  }

  /**
   * Indicates whether the import outcome is error-free.
   */
  public isSuccessful(): boolean {
    return this.errorCount === 0;
  }

  /**
   * Indicates whether this outcome contains any processed questions.
   */
  public hasProcessedQuestions(): boolean {
    return this.getTotalProcessed() > 0;
  }

  /**
   * Returns the total elapsed processing time captured for this outcome.
   */
  public getProcessingDuration(): number {
    return this.processingDuration;
  }

  /**
   * Indicates whether no questions were processed for this import outcome.
   */
  public isEmpty(): boolean {
    return this.getTotalProcessed() === 0;
  }

  /**
   * Returns the import success ratio as questionsImported / totalProcessed.
   *
   * Returns a ratio between 0 and 1.
   *
   * The presentation layer is responsible for converting this ratio into a percentage if required.
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
   * Indicates whether another ImportStatistics represents the same business outcome snapshot.
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