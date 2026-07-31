import { TemplateProfileVersion } from "./TemplateProfileVersion";

/**
 * Properties required to construct an immutable TemplateProfile aggregate root.
 */
export interface TemplateProfileProps {
  id: string;
  organizationId: string;
  name: string;
  versions: readonly TemplateProfileVersion[];
  createdBy: string;
  createdAt: Date;
}

/**
 * Represents the logical identity of a reusable template and owns version history.
 *
 * TemplateProfile is the aggregate root for TemplateProfileVersion instances.
 */
export class TemplateProfile {
  /** Unique identifier for this template profile. */
  public readonly id: string;

  /** Organization that owns this template profile. */
  public readonly organizationId: string;

  /** Human-readable template profile name. */
  public readonly name: string;

  /** User identifier that created this template profile. */
  public readonly createdBy: string;

  private readonly versionsValue: readonly TemplateProfileVersion[];
  private readonly createdAtValue: Date;

  /**
   * Creates a new immutable TemplateProfile aggregate root.
   */
  constructor(props: TemplateProfileProps) {
    this.validate(props);

    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.versionsValue = [...props.versions];
    this.createdBy = props.createdBy;
    this.createdAtValue = new Date(props.createdAt.getTime());

    Object.freeze(this.versionsValue);
    Object.freeze(this);
  }

  /**
   * Returns all profile versions as a defensive copy.
   */
  public getVersions(): readonly TemplateProfileVersion[] {
    return [...this.versionsValue];
  }

  /**
   * Returns the latest version based on the highest version number.
   */
  public getLatestVersion(): TemplateProfileVersion {
    return this.versionsValue.reduce((latest, candidate) =>
      candidate.getVersionNumber() > latest.getVersionNumber() ? candidate : latest,
    );
  }

  /**
   * Returns the version matching the provided version number, or undefined when absent.
   */
  public getVersion(versionNumber: number): TemplateProfileVersion | undefined {
    this.validateVersionNumber(versionNumber, "versionNumber");

    return this.versionsValue.find((version) => version.isVersion(versionNumber));
  }

  /**
   * Returns true when a version with the provided number exists.
   */
  public hasVersion(versionNumber: number): boolean {
    this.validateVersionNumber(versionNumber, "versionNumber");

    return this.getVersion(versionNumber) !== undefined;
  }

  /**
   * Returns the total number of versions owned by this profile.
   */
  public getVersionCount(): number {
    return this.versionsValue.length;
  }

  /**
   * Returns a new immutable profile with the supplied version appended.
   *
   * Rejects duplicate version numbers and duplicate fingerprints.
   */
  public addVersion(version: TemplateProfileVersion): TemplateProfile {
    if (version === null || version === undefined) {
      throw new Error(
        "Invalid TemplateProfile: version cannot be null or undefined.",
      );
    }

    if (this.hasVersion(version.getVersionNumber())) {
      throw new Error(
        `Invalid TemplateProfile: duplicate versionNumber '${version.getVersionNumber()}' is not allowed.`,
      );
    }

    if (this.containsFingerprint(version.getFingerprint())) {
      throw new Error(
        `Invalid TemplateProfile: duplicate fingerprint '${version.getFingerprint()}' is not allowed.`,
      );
    }

    return new TemplateProfile({
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      versions: [...this.versionsValue, version],
      createdBy: this.createdBy,
      createdAt: this.createdAt,
    });
  }

  /**
   * Returns true when any owned version matches the provided fingerprint.
   */
  public containsFingerprint(fingerprint: string): boolean {
    this.validateNonEmptyString(fingerprint, "fingerprint");

    return this.versionsValue.some((version) => version.hasFingerprint(fingerprint));
  }

  /**
   * Returns the creation timestamp as a defensive copy.
   */
  public get createdAt(): Date {
    return new Date(this.createdAtValue.getTime());
  }

  private validate(props: TemplateProfileProps): void {
    this.validateNonEmptyString(props.id, "id");
    this.validateNonEmptyString(props.organizationId, "organizationId");
    this.validateNonEmptyString(props.name, "name");
    this.validateNonEmptyString(props.createdBy, "createdBy");

    if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt.getTime())) {
      throw new Error("Invalid TemplateProfile: createdAt must be a valid Date.");
    }

    if (props.versions === null || props.versions === undefined) {
      throw new Error(
        "Invalid TemplateProfile: versions cannot be null or undefined.",
      );
    }

    if (props.versions.length === 0) {
      throw new Error(
        "Invalid TemplateProfile: versions must contain at least one TemplateProfileVersion.",
      );
    }
  }

  private validateNonEmptyString(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(
        `Invalid TemplateProfile: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(`Invalid TemplateProfile: ${fieldName} must be a string.`);
    }

    if (value.trim().length === 0) {
      throw new Error(`Invalid TemplateProfile: ${fieldName} cannot be empty.`);
    }
  }

  private validateVersionNumber(value: number, fieldName: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(
        `Invalid TemplateProfile: ${fieldName} must be an integer greater than 0.`,
      );
    }
  }
}
