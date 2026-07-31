/**
 * Represents the final mapping approved by a user between one source
 * spreadsheet column and one field in the Canonical Question Model.
 *
 * This object is created only after the user reviews and approves AI
 * mapping suggestions.
 *
 * Once created, the mapping is immutable and may later become part of
 * a reusable Template Profile.
 */
export class ColumnMapping {
	/** Unique identifier for this mapping. */
	public readonly id: string;

	/** Exact source column name from the external file. */
	public readonly sourceColumn: string;

	/** Canonical question model field name. */
	public readonly canonicalField: string;

	/** Original AI confidence score at suggestion time. */
	public readonly confidence: number;

	/** User identifier of the approver. */
	public readonly approvedBy: string;

	/** Timestamp when the mapping was approved. */
	public readonly approvedAt: Date;

	constructor(params: {
		id: string;
		sourceColumn: string;
		canonicalField: string;
		confidence: number;
		approvedBy: string;
		approvedAt: Date;
	}) {
		this.id = params.id;
		this.sourceColumn = params.sourceColumn;
		this.canonicalField = params.canonicalField;
		this.confidence = params.confidence;
		this.approvedBy = params.approvedBy;
		this.approvedAt = params.approvedAt;

		this.validate();
	}

	/**
	 * Validates core domain invariants for this mapping.
	 */
	private validate(): void {
		this.validateNonEmptyString(this.id, "id");
		this.validateNonEmptyString(this.sourceColumn, "sourceColumn");
		this.validateNonEmptyString(this.canonicalField, "canonicalField");
		this.validateNonEmptyString(this.approvedBy, "approvedBy");
		this.validateConfidence(this.confidence);
		this.validateApprovedAt(this.approvedAt);
	}

	/**
	 * Returns true when this mapping targets the provided canonical field.
	 */
	public isMappedTo(canonicalField: string): boolean {
		return this.canonicalField === canonicalField;
	}

	private validateNonEmptyString(value: string, fieldName: string): void {
		if (value.trim().length === 0) {
			throw new Error(`Invalid ColumnMapping: ${fieldName} cannot be empty.`);
		}
	}

	private validateConfidence(value: number): void {
		if (!Number.isFinite(value) || value < 0 || value > 1) {
			throw new Error(
				"Invalid ColumnMapping: confidence must be a number between 0 and 1 inclusive.",
			);
		}
	}

	private validateApprovedAt(value: Date): void {
		if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
			throw new Error("Invalid ColumnMapping: approvedAt must be a valid Date.");
		}
	}
}