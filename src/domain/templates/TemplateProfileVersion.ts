import { ColumnMapping } from "./ColumnMapping";

export interface TemplateProfileVersionProps {
  id: string;
  versionNumber: number;
  fingerprint: string;
  columnMappings: readonly ColumnMapping[];
  createdBy: string;
  createdAt: Date;
  notes?: string;
}

/**
 * Represents one immutable, versioned snapshot of an approved template mapping.
 *
 * A TemplateProfileVersion preserves the exact set of approved column mappings,
 * fingerprint, and audit metadata for deterministic reuse and traceability.
 */
export class TemplateProfileVersion {
  /** Unique identifier for this template profile version. */
  public readonly id: string;

  /** Sequential version number within a template profile lineage. */
  public readonly versionNumber: number;

  /** Stable fingerprint for this approved template structure. */
  public readonly fingerprint: string;

  /** User identifier that created this version. */
  public readonly createdBy: string;

  /** Optional notes captured when this version was created. */
  public readonly notes?: string;

  private readonly mappings: readonly ColumnMapping[];
  private readonly createdAtValue: Date;

  /**
   * Creates a new immutable TemplateProfileVersion.
   */
  constructor(props: TemplateProfileVersionProps) {
    this.validate(props);

    this.id = props.id;
    this.versionNumber = props.versionNumber;
    this.fingerprint = props.fingerprint;
    this.mappings = [...props.columnMappings];
    this.createdBy = props.createdBy;
    this.createdAtValue = new Date(props.createdAt.getTime());
    this.notes = props.notes;

    Object.freeze(this.mappings);
    Object.freeze(this);
  }

  /**
   * Returns a defensive copy of all approved column mappings.
   */
  public getColumnMappings(): readonly ColumnMapping[] {
    return [...this.mappings];
  }

  /**
   * Returns the number of approved mappings stored in this version.
   */
  public getMappingCount(): number {
    return this.mappings.length;
  }

  /**
   * Returns this version's sequential number.
   */
  public getVersionNumber(): number {
    return this.versionNumber;
  }

  /**
   * Returns this version's fingerprint.
   */
  public getFingerprint(): string {
    return this.fingerprint;
  }

  /**
   * Returns true when at least one mapping targets the provided canonical field.
   */
  public containsCanonicalField(fieldName: string): boolean {
    return this.mappings.some((mapping) => mapping.isMappedTo(fieldName));
  }

  /**
   * Returns a human-readable label for this version.
   */
  public getVersionLabel(): string {
    return `Version ${this.versionNumber}`;
  }

  /**
   * Returns true when this version has the provided fingerprint.
   */
  public hasFingerprint(fingerprint: string): boolean {
    return this.fingerprint === fingerprint;
  }

  /**
   * Returns true when this instance matches the provided version number.
   */
  public isVersion(version: number): boolean {
    return this.versionNumber === version;
  }

  /**
   * Returns the creation timestamp as a defensive copy.
   */
  public get createdAt(): Date {
    return new Date(this.createdAtValue.getTime());
  }

  private validate(props: TemplateProfileVersionProps): void {
    this.validateNonEmptyString(props.id, "id");

    if (!Number.isInteger(props.versionNumber) || props.versionNumber <= 0) {
      throw new Error(
        "Invalid TemplateProfileVersion: versionNumber must be an integer greater than 0.",
      );
    }

    this.validateNonEmptyString(props.fingerprint, "fingerprint");

    if (props.columnMappings === null || props.columnMappings === undefined) {
      throw new Error(
        "Invalid TemplateProfileVersion: columnMappings must be provided.",
      );
    }

    if (props.columnMappings.length === 0) {
      throw new Error(
        "Invalid TemplateProfileVersion: at least one ColumnMapping is required.",
      );
    }

    this.validateNonEmptyString(props.createdBy, "createdBy");

    if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt.getTime())) {
      throw new Error(
        "Invalid TemplateProfileVersion: createdAt must be a valid Date.",
      );
    }

    if (props.notes !== undefined) {
      this.validateNonEmptyString(props.notes, "notes");
    }
  }

  private validateNonEmptyString(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(
        `Invalid TemplateProfileVersion: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(
        `Invalid TemplateProfileVersion: ${fieldName} must be a string.`,
      );
    }

    if (value.trim().length === 0) {
      throw new Error(
        `Invalid TemplateProfileVersion: ${fieldName} cannot be empty.`,
      );
    }
  }
}
