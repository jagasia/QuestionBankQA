import { TemplateMatchType } from "./TemplateMatchType";
import { TemplateProfileVersion } from "./TemplateProfileVersion";

export interface TemplateDetectionResultProps {
  matchType: TemplateMatchType;
  templateProfileVersion?: TemplateProfileVersion;
  confidence: number;
}

/**
 * Represents the immutable outcome of template detection for an import.
 *
 * This value object captures how a template was matched and the confidence
 * associated with that match.
 */
export class TemplateDetectionResult {
  /** Match category used to resolve the template. */
  public readonly matchType: TemplateMatchType;

  private readonly templateProfileVersionValue?: TemplateProfileVersion;
  private readonly confidenceValue: number;

  /**
   * Creates a new immutable TemplateDetectionResult.
   */
  constructor(props: TemplateDetectionResultProps) {
    this.validate(props);

    this.matchType = props.matchType;
    this.templateProfileVersionValue = props.templateProfileVersion;
    this.confidenceValue = props.confidence;

    Object.freeze(this);
  }

  /**
   * Returns true when this result resolved to any match type other than NONE.
   */
  public hasMatch(): boolean {
    return this.matchType !== TemplateMatchType.NONE;
  }

  /**
   * Returns true when this result is an exact fingerprint match.
   */
  public isExactMatch(): boolean {
    return this.matchType === TemplateMatchType.EXACT;
  }

  /**
   * Returns true when this result is a heuristic similarity match.
   */
  public isSimilarMatch(): boolean {
    return this.matchType === TemplateMatchType.SIMILAR;
  }

  /**
   * Returns true when this result is an AI-assisted match.
   */
  public isAiMatch(): boolean {
    return this.matchType === TemplateMatchType.AI;
  }

  /**
   * Returns the matched TemplateProfileVersion.
   *
   * Throws when this result has no match.
   */
  public getTemplateProfileVersion(): TemplateProfileVersion {
    if (this.matchType === TemplateMatchType.NONE) {
      throw new Error(
        "Invalid TemplateDetectionResult: no matched TemplateProfileVersion exists for NONE matchType.",
      );
    }

    if (this.templateProfileVersionValue === undefined) {
      throw new Error(
        "Invalid TemplateDetectionResult: templateProfileVersion is required for matched results.",
      );
    }

    return this.templateProfileVersionValue;
  }

  /**
   * Returns the confidence score associated with this detection outcome.
   */
  public getConfidence(): number {
    return this.confidenceValue;
  }

  /**
   * Returns the match category for this detection outcome.
   */
  public getMatchType(): TemplateMatchType {
    return this.matchType;
  }

  private validate(props: TemplateDetectionResultProps): void {
    if (props === null || props === undefined) {
      throw new Error(
        "Invalid TemplateDetectionResult: props cannot be null or undefined.",
      );
    }

    this.validateMatchType(props.matchType);
    this.validateConfidence(props.confidence);

    if (props.templateProfileVersion === null) {
      throw new Error(
        "Invalid TemplateDetectionResult: templateProfileVersion cannot be null.",
      );
    }

    if (props.matchType === TemplateMatchType.NONE) {
      this.validateNone(props);
      return;
    }

    if (props.matchType === TemplateMatchType.EXACT) {
      this.validateExact(props);
      return;
    }

    if (props.matchType === TemplateMatchType.SIMILAR) {
      this.validateSimilar(props);
      return;
    }

    if (props.matchType === TemplateMatchType.AI) {
      this.validateAi(props);
      return;
    }

    throw new Error(
      "Invalid TemplateDetectionResult: matchType must be a valid TemplateMatchType value.",
    );
  }

  private validateMatchType(value: unknown): void {
    if (value === null || value === undefined) {
      throw new Error(
        "Invalid TemplateDetectionResult: matchType cannot be null or undefined.",
      );
    }

    if (!Object.values(TemplateMatchType).includes(value as TemplateMatchType)) {
      throw new Error(
        "Invalid TemplateDetectionResult: matchType must be a valid TemplateMatchType value.",
      );
    }
  }

  private validateConfidence(value: unknown): void {
    if (value === null || value === undefined) {
      throw new Error(
        "Invalid TemplateDetectionResult: confidence cannot be null or undefined.",
      );
    }

    if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
      throw new Error(
        "Invalid TemplateDetectionResult: confidence must be a number.",
      );
    }
  }

  private validateNone(props: TemplateDetectionResultProps): void {
    if (props.templateProfileVersion !== undefined) {
      throw new Error(
        "Invalid TemplateDetectionResult: NONE matchType requires templateProfileVersion to be undefined.",
      );
    }

    if (props.confidence !== 0) {
      throw new Error(
        "Invalid TemplateDetectionResult: NONE matchType requires confidence to equal 0.",
      );
    }
  }

  private validateExact(props: TemplateDetectionResultProps): void {
    if (props.templateProfileVersion === undefined) {
      throw new Error(
        "Invalid TemplateDetectionResult: EXACT matchType requires templateProfileVersion.",
      );
    }

    if (props.confidence !== 1) {
      throw new Error(
        "Invalid TemplateDetectionResult: EXACT matchType requires confidence to equal 1.",
      );
    }
  }

  private validateSimilar(props: TemplateDetectionResultProps): void {
    if (props.templateProfileVersion === undefined) {
      throw new Error(
        "Invalid TemplateDetectionResult: SIMILAR matchType requires templateProfileVersion.",
      );
    }

    if (!(props.confidence > 0 && props.confidence < 1)) {
      throw new Error(
        "Invalid TemplateDetectionResult: SIMILAR matchType requires confidence greater than 0 and less than 1.",
      );
    }
  }

  private validateAi(props: TemplateDetectionResultProps): void {
    if (props.templateProfileVersion === undefined) {
      throw new Error(
        "Invalid TemplateDetectionResult: AI matchType requires templateProfileVersion.",
      );
    }

    if (!(props.confidence > 0 && props.confidence <= 1)) {
      throw new Error(
        "Invalid TemplateDetectionResult: AI matchType requires confidence greater than 0 and less than or equal to 1.",
      );
    }
  }
}