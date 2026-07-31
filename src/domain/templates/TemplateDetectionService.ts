import { TemplateDetectionResult } from "./TemplateDetectionResult";
import { TemplateMatchType } from "./TemplateMatchType";
import { TemplateProfile } from "./TemplateProfile";
import { TemplateProfileVersion } from "./TemplateProfileVersion";

/**
 * Stateless domain service that resolves the approved template version for an
 * uploaded workbook fingerprint.
 *
 * This implementation supports exact fingerprint matching only.
 */
export class TemplateDetectionService {
  /**
   * Detects the best template match for the supplied fingerprint.
   *
   * Returns an EXACT result when a matching approved version exists, otherwise
   * returns a NONE result.
   */
  public detect(
    fingerprint: string,
    templateProfiles: readonly TemplateProfile[],
  ): TemplateDetectionResult {
    this.validate(fingerprint, templateProfiles);

    const matchedVersion = this.findExactMatch(fingerprint, templateProfiles);

    if (matchedVersion !== undefined) {
      return this.createExactResult(matchedVersion);
    }

    return this.createNoMatchResult();
  }

  /**
   * Validates detect() input values before executing matching logic.
   */
  private validate(
    fingerprint: string,
    templateProfiles: readonly TemplateProfile[],
  ): void {
    this.validateNonEmptyString(fingerprint, "fingerprint");

    if (templateProfiles === null || templateProfiles === undefined) {
      throw new Error(
        "Invalid TemplateDetectionService input: templateProfiles cannot be null or undefined.",
      );
    }
  }

  /**
   * Finds the first approved version whose domain fingerprint matcher reports
   * an exact match for the supplied fingerprint.
   */
  private findExactMatch(
    fingerprint: string,
    templateProfiles: readonly TemplateProfile[],
  ): TemplateProfileVersion | undefined {
    for (const profile of templateProfiles) {
      const matchedVersion = profile.findVersionByFingerprint(fingerprint);

      if (matchedVersion !== undefined) {
        return matchedVersion;
      }
    }

    return undefined;
  }

  /**
   * Creates a TemplateDetectionResult for an exact fingerprint match.
   */
  private createExactResult(
    matchedVersion: TemplateProfileVersion,
  ): TemplateDetectionResult {
    return new TemplateDetectionResult({
      matchType: TemplateMatchType.EXACT,
      templateProfileVersion: matchedVersion,
      confidence: 1,
    });
  }

  /**
   * Creates a TemplateDetectionResult indicating no template match.
   */
  private createNoMatchResult(): TemplateDetectionResult {
    return new TemplateDetectionResult({
      matchType: TemplateMatchType.NONE,
      templateProfileVersion: undefined,
      confidence: 0,
    });
  }

  /**
   * Validates that a required string input is present and non-empty.
   */
  private validateNonEmptyString(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(
        `Invalid TemplateDetectionService input: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(
        `Invalid TemplateDetectionService input: ${fieldName} must be a string.`,
      );
    }

    if (value.trim().length === 0) {
      throw new Error(
        `Invalid TemplateDetectionService input: ${fieldName} cannot be empty.`,
      );
    }
  }
}