import { TemplateProfileVersion } from "../templates/TemplateProfileVersion";
import { ImportStatistics } from "./ImportStatistics";
import { ImportStatus } from "./ImportStatus";

/**
 * Properties required to construct an immutable ImportJob aggregate root.
 */
export interface ImportJobProps {
  id: string;
  createdBy: string;
  createdAt: Date;
  status: ImportStatus;
  templateProfileVersion?: TemplateProfileVersion;
  statistics?: ImportStatistics;
  warnings: readonly string[];
  errors: readonly string[];
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Represents the complete business lifecycle of a single workbook import.
 *
 * ImportJob is the aggregate root for the import domain and owns business state only.
 */
export class ImportJob {
  /** Unique identifier for this import job. */
  public readonly id: string;

  /** User identifier that created this import job. */
  public readonly createdBy: string;

  private readonly statusValue: ImportStatus;
  private readonly templateProfileVersionValue?: TemplateProfileVersion;
  private readonly statisticsValue?: ImportStatistics;
  private readonly warningsValue: readonly string[];
  private readonly errorsValue: readonly string[];
  private readonly createdAtValue: Date;
  private readonly startedAtValue?: Date;
  private readonly completedAtValue?: Date;

  /**
   * Creates a new immutable ImportJob aggregate root.
   */
  constructor(props: ImportJobProps) {
    this.validate(props);

    this.id = props.id;
    this.createdBy = props.createdBy;
    this.statusValue = props.status;
    this.templateProfileVersionValue = props.templateProfileVersion;
    this.statisticsValue = props.statistics;
    this.warningsValue = [...props.warnings];
    this.errorsValue = [...props.errors];
    this.createdAtValue = new Date(props.createdAt.getTime());
    this.startedAtValue = props.startedAt === undefined
      ? undefined
      : new Date(props.startedAt.getTime());
    this.completedAtValue = props.completedAt === undefined
      ? undefined
      : new Date(props.completedAt.getTime());

    Object.freeze(this.warningsValue);
    Object.freeze(this.errorsValue);
    Object.freeze(this);
  }

  /**
   * Transitions the import job from Created to Parsing.
   */
  public startParsing(): ImportJob {
    this.assertTransitionAllowed(ImportStatus.Parsing);

    return this.createUpdatedJob({
      status: ImportStatus.Parsing,
      startedAt: this.startedAtValue ?? new Date(),
    });
  }

  /**
   * Records the detected template profile version and transitions to DetectingTemplate.
   */
  public detectTemplate(templateProfileVersion: TemplateProfileVersion): ImportJob {
    if (templateProfileVersion === null || templateProfileVersion === undefined) {
      throw new Error(
        "Invalid ImportJob: templateProfileVersion cannot be null or undefined.",
      );
    }

    this.assertTransitionAllowed(ImportStatus.DetectingTemplate);

    return this.createUpdatedJob({
      status: ImportStatus.DetectingTemplate,
      templateProfileVersion,
    });
  }

  /**
   * Transitions the import job to AwaitingUserApproval after template detection.
   */
  public awaitUserApproval(): ImportJob {
    this.assertTransitionAllowed(ImportStatus.AwaitingUserApproval);

    if (this.templateProfileVersionValue === undefined) {
      throw new Error(
        "Invalid ImportJob transition: AwaitingUserApproval requires a detected templateProfileVersion.",
      );
    }

    return this.createUpdatedJob({
      status: ImportStatus.AwaitingUserApproval,
    });
  }

  /**
   * Transitions the import job to ImportingQuestions after user approval.
   */
  public startImport(): ImportJob {
    this.assertTransitionAllowed(ImportStatus.ImportingQuestions);

    if (this.templateProfileVersionValue === undefined) {
      throw new Error(
        "Invalid ImportJob transition: ImportingQuestions requires a detected templateProfileVersion.",
      );
    }

    return this.createUpdatedJob({
      status: ImportStatus.ImportingQuestions,
      startedAt: this.startedAtValue ?? new Date(),
    });
  }

  /**
   * Completes the import job with final immutable import statistics.
   */
  public complete(statistics: ImportStatistics): ImportJob {
    if (statistics === null || statistics === undefined) {
      throw new Error(
        "Invalid ImportJob: statistics cannot be null or undefined.",
      );
    }

    this.assertTransitionAllowed(ImportStatus.Completed);

    return this.createUpdatedJob({
      status: ImportStatus.Completed,
      statistics,
      completedAt: new Date(),
    });
  }

  /**
   * Marks the import job as failed with a descriptive business failure reason.
   */
  public fail(reason: string): ImportJob {
    this.validateNonEmptyString(reason, "reason");
    this.assertTransitionAllowed(ImportStatus.Failed);

    return this.createUpdatedJob({
      status: ImportStatus.Failed,
      errors: [...this.errorsValue, reason],
      completedAt: new Date(),
    });
  }

  /**
   * Indicates whether this import job reached the Completed terminal state.
   */
  public isCompleted(): boolean {
    return this.statusValue === ImportStatus.Completed;
  }

  /**
   * Indicates whether this import job reached the Failed terminal state.
   */
  public isFailed(): boolean {
    return this.statusValue === ImportStatus.Failed;
  }

  /**
   * Indicates whether this import job is currently waiting for user approval.
   */
  public isAwaitingApproval(): boolean {
    return this.statusValue === ImportStatus.AwaitingUserApproval;
  }

  /**
   * Returns the current business lifecycle status.
   */
  public getStatus(): ImportStatus {
    return this.statusValue;
  }

  /**
   * Returns final import statistics when the job has produced an outcome snapshot.
   */
  public getStatistics(): ImportStatistics | undefined {
    return this.statisticsValue;
  }

  /**
   * Returns the detected template profile version associated with this import job.
   */
  public getTemplateProfileVersion(): TemplateProfileVersion | undefined {
    return this.templateProfileVersionValue;
  }

  /**
   * Returns true when this import job can transition to the provided status.
   */
  public canTransitionTo(status: ImportStatus): boolean {
    this.validateStatus(status, "status");

    switch (this.statusValue) {
      case ImportStatus.Created:
        return status === ImportStatus.Parsing || status === ImportStatus.Failed;
      case ImportStatus.Parsing:
        return status === ImportStatus.DetectingTemplate || status === ImportStatus.Failed;
      case ImportStatus.DetectingTemplate:
        return status === ImportStatus.AwaitingUserApproval || status === ImportStatus.Failed;
      case ImportStatus.AwaitingUserApproval:
        return status === ImportStatus.ImportingQuestions || status === ImportStatus.Failed;
      case ImportStatus.ImportingQuestions:
        return status === ImportStatus.Completed || status === ImportStatus.Failed;
      case ImportStatus.Completed:
      case ImportStatus.Failed:
        return false;
      default:
        return false;
    }
  }

  /**
   * Returns all business warnings as a defensive copy.
   */
  public getWarnings(): readonly string[] {
    return [...this.warningsValue];
  }

  /**
   * Returns all business errors as a defensive copy.
   */
  public getErrors(): readonly string[] {
    return [...this.errorsValue];
  }

  /**
   * Returns the creation timestamp as a defensive copy.
   */
  public get createdAt(): Date {
    return new Date(this.createdAtValue.getTime());
  }

  /**
   * Returns the parsing start timestamp as a defensive copy when present.
   */
  public get startedAt(): Date | undefined {
    return this.startedAtValue === undefined
      ? undefined
      : new Date(this.startedAtValue.getTime());
  }

  /**
   * Returns the completion timestamp as a defensive copy when present.
   */
  public get completedAt(): Date | undefined {
    return this.completedAtValue === undefined
      ? undefined
      : new Date(this.completedAtValue.getTime());
  }

  private assertTransitionAllowed(nextStatus: ImportStatus): void {
    if (!this.canTransitionTo(nextStatus)) {
      throw new Error(
        `Invalid ImportJob transition: cannot transition from '${this.statusValue}' to '${nextStatus}'.`,
      );
    }
  }

  private createUpdatedJob(changes: Partial<ImportJobProps>): ImportJob {
    return new ImportJob({
      id: this.id,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      status: changes.status ?? this.statusValue,
      templateProfileVersion: changes.templateProfileVersion ?? this.templateProfileVersionValue,
      statistics: changes.statistics ?? this.statisticsValue,
      warnings: changes.warnings ?? this.getWarnings(),
      errors: changes.errors ?? this.getErrors(),
      startedAt: changes.startedAt ?? this.startedAt,
      completedAt: changes.completedAt ?? this.completedAt,
    });
  }

  private validate(props: ImportJobProps): void {
    if (props === null || props === undefined) {
      throw new Error("Invalid ImportJob: props cannot be null or undefined.");
    }

    this.validateNonEmptyString(props.id, "id");
    this.validateNonEmptyString(props.createdBy, "createdBy");

    if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt.getTime())) {
      throw new Error("Invalid ImportJob: createdAt must be a valid Date.");
    }

    this.validateStatus(props.status, "status");

    if (props.templateProfileVersion === null) {
      throw new Error(
        "Invalid ImportJob: templateProfileVersion cannot be null.",
      );
    }

    if (props.statistics === null) {
      throw new Error("Invalid ImportJob: statistics cannot be null.");
    }

    this.validateStringCollection(props.warnings, "warnings");
    this.validateStringCollection(props.errors, "errors");

    if (props.startedAt !== undefined) {
      this.validateDate(props.startedAt, "startedAt");
    }

    if (props.completedAt !== undefined) {
      this.validateDate(props.completedAt, "completedAt");
    }

    if (props.startedAt !== undefined && props.startedAt.getTime() < props.createdAt.getTime()) {
      throw new Error(
        "Invalid ImportJob: startedAt cannot be earlier than createdAt.",
      );
    }

    if (props.completedAt !== undefined && props.completedAt.getTime() < props.createdAt.getTime()) {
      throw new Error(
        "Invalid ImportJob: completedAt cannot be earlier than createdAt.",
      );
    }

    if (
      props.startedAt !== undefined
      && props.completedAt !== undefined
      && props.completedAt.getTime() < props.startedAt.getTime()
    ) {
      throw new Error(
        "Invalid ImportJob: completedAt cannot be earlier than startedAt.",
      );
    }

    if (props.status === ImportStatus.Completed) {
      if (props.statistics === undefined) {
        throw new Error(
          "Invalid ImportJob: Completed status requires statistics.",
        );
      }

      if (props.completedAt === undefined) {
        throw new Error(
          "Invalid ImportJob: Completed status requires completedAt.",
        );
      }
    }

    if (props.status === ImportStatus.Failed && props.completedAt === undefined) {
      throw new Error(
        "Invalid ImportJob: Failed status requires completedAt.",
      );
    }

    if (
      (props.status === ImportStatus.AwaitingUserApproval || props.status === ImportStatus.ImportingQuestions)
      && props.templateProfileVersion === undefined
    ) {
      throw new Error(
        "Invalid ImportJob: current status requires templateProfileVersion.",
      );
    }

    if (
      (props.status === ImportStatus.Parsing
        || props.status === ImportStatus.DetectingTemplate
        || props.status === ImportStatus.AwaitingUserApproval
        || props.status === ImportStatus.ImportingQuestions
        || props.status === ImportStatus.Completed)
      && props.startedAt === undefined
    ) {
      throw new Error(
        "Invalid ImportJob: current status requires startedAt.",
      );
    }
  }

  private validateNonEmptyString(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(
        `Invalid ImportJob: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(`Invalid ImportJob: ${fieldName} must be a string.`);
    }

    if (value.trim().length === 0) {
      throw new Error(`Invalid ImportJob: ${fieldName} cannot be empty.`);
    }
  }

  private validateStringCollection(values: readonly string[], fieldName: string): void {
    if (values === null || values === undefined) {
      throw new Error(
        `Invalid ImportJob: ${fieldName} cannot be null or undefined.`,
      );
    }

    for (const value of values) {
      this.validateNonEmptyString(value, `${fieldName} item`);
    }
  }

  private validateStatus(status: unknown, fieldName: string): void {
    if (status === null || status === undefined) {
      throw new Error(
        `Invalid ImportJob: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (!Object.values(ImportStatus).includes(status as ImportStatus)) {
      throw new Error(
        `Invalid ImportJob: ${fieldName} must be a valid ImportStatus value.`,
      );
    }
  }

  private validateDate(value: unknown, fieldName: string): void {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new Error(`Invalid ImportJob: ${fieldName} must be a valid Date.`);
    }
  }
}