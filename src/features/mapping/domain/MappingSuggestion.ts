/**
 * One AI-proposed candidate mapping for a source column.
 */
export interface MappingCandidate {
  /** Canonical field proposed by AI. */
  canonicalField: string;

  /** Confidence score for this candidate, from 0 to 1 inclusive. */
  confidence: number;

  /** Rank of this candidate where 1 is the top suggestion. */
  rank: number;
}

/**
 * Represents AI-generated mapping suggestions for one source Excel column.
 *
 * This model captures AI output only. It does not represent an approved mapping.
 */
export class MappingSuggestion {
  /** Unique identifier for this suggestion set. */
  public readonly id: string;

  /** Exact source column name from the uploaded workbook. */
  public readonly sourceColumn: string;

  /** Ranked mapping candidates produced by AI. */
  private readonly suggestions: readonly MappingCandidate[];

  constructor(params: {
    id: string;
    sourceColumn: string;
    suggestions: MappingCandidate[];
  }) {
    this.id = params.id;
    this.sourceColumn = params.sourceColumn;
    this.suggestions = params.suggestions.map((candidate) => ({ ...candidate }));

    this.validate();

    // Freeze nested candidates and the top-level array to preserve immutability.
    this.suggestions.forEach((candidate) => Object.freeze(candidate));
    Object.freeze(this.suggestions);
    Object.freeze(this);
  }

  /**
   * Returns the highest-ranked suggestion (rank = 1).
   */
  public getTopSuggestion(): MappingCandidate {
    return this.suggestions[0];
  }

  /**
   * Returns a suggestion by rank, if present.
   */
  public getSuggestionByRank(rank: number): MappingCandidate | undefined {
    return this.suggestions.find((candidate) => candidate.rank === rank);
  }

  /**
   * Returns all suggestions in rank order.
   */
  public getSuggestions(): readonly MappingCandidate[] {
    return [...this.suggestions];
  }

  private validate(): void {
    this.validateNonEmptyString(this.id, "id");
    this.validateNonEmptyString(this.sourceColumn, "sourceColumn");
    this.validateSuggestionsPresent(this.suggestions);
    this.validateCandidateShapes(this.suggestions);
    this.validateUniqueRanks(this.suggestions);
    this.validateRanksStartAtOne(this.suggestions);
    this.validateConsecutiveRanks(this.suggestions);
    this.validateOrderedByRank(this.suggestions);
  }

  private validateNonEmptyString(value: string, fieldName: string): void {
    if (value.trim().length === 0) {
      throw new Error(`Invalid MappingSuggestion: ${fieldName} cannot be empty.`);
    }
  }

  private validateSuggestionsPresent(candidates: readonly MappingCandidate[]): void {
    if (candidates.length === 0) {
      throw new Error(
        "Invalid MappingSuggestion: at least one mapping candidate is required.",
      );
    }
  }

  private validateCandidateShapes(candidates: readonly MappingCandidate[]): void {
    candidates.forEach((candidate, index) => {
      this.validateNonEmptyString(
        candidate.canonicalField,
        `suggestions[${index}].canonicalField`,
      );

      if (!Number.isFinite(candidate.confidence) || candidate.confidence < 0 || candidate.confidence > 1) {
        throw new Error(
          `Invalid MappingSuggestion: suggestions[${index}].confidence must be a number between 0 and 1 inclusive.`,
        );
      }

      if (!Number.isInteger(candidate.rank) || candidate.rank < 1) {
        throw new Error(
          `Invalid MappingSuggestion: suggestions[${index}].rank must be an integer greater than or equal to 1.`,
        );
      }
    });
  }

  private validateUniqueRanks(candidates: readonly MappingCandidate[]): void {
    const ranks = candidates.map((candidate) => candidate.rank);
    const uniqueRanks = new Set(ranks);

    if (uniqueRanks.size !== ranks.length) {
      throw new Error("Invalid MappingSuggestion: candidate ranks must be unique.");
    }
  }

  private validateRanksStartAtOne(candidates: readonly MappingCandidate[]): void {
    const minRank = Math.min(...candidates.map((candidate) => candidate.rank));

    if (minRank !== 1) {
      throw new Error("Invalid MappingSuggestion: candidate ranks must start at 1.");
    }
  }

  private validateConsecutiveRanks(candidates: readonly MappingCandidate[]): void {
    const sortedRanks = [...candidates]
      .map((candidate) => candidate.rank)
      .sort((a, b) => a - b);

    for (let index = 1; index < sortedRanks.length; index += 1) {
      const previous = sortedRanks[index - 1];
      const current = sortedRanks[index];

      if (current !== previous + 1) {
        throw new Error(
          `Invalid MappingSuggestion: candidate ranks must be consecutive. Missing rank ${previous + 1}.`,
        );
      }
    }
  }

  private validateOrderedByRank(candidates: readonly MappingCandidate[]): void {
    for (let index = 1; index < candidates.length; index += 1) {
      if (candidates[index - 1].rank > candidates[index].rank) {
        throw new Error(
          "Invalid MappingSuggestion: suggestions must be ordered by rank in ascending order.",
        );
      }
    }
  }
}
