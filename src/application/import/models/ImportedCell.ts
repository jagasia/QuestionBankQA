/**
 * Properties required to construct an immutable ImportedCell.
 */
export interface ImportedCellProps {
  columnName: string;
  value: string;
}

/**
 * Represents one parsed cell from an imported worksheet.
 */
export class ImportedCell {
  /** Column name associated with this parsed cell. */
  public readonly columnName: string;

  /** Parsed cell value preserved as a string. */
  public readonly value: string;

  /**
   * Creates a new immutable ImportedCell.
   */
  constructor(props: ImportedCellProps) {
    this.validate(props);

    this.columnName = props.columnName;
    this.value = props.value;

    Object.freeze(this);
  }

  /**
   * Validates the cell properties before assignment.
   */
  private validate(props: ImportedCellProps): void {
    if (props === null || props === undefined) {
      throw new Error(
        "Invalid ImportedCell: props cannot be null or undefined.",
      );
    }

    this.validateNonEmptyString(props.columnName, "columnName");
    this.validateStringValue(props.value, "value");
  }

  /**
   * Validates that a required string input is present and non-empty.
   */
  private validateNonEmptyString(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(
        `Invalid ImportedCell: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(`Invalid ImportedCell: ${fieldName} must be a string.`);
    }

    if (value.trim().length === 0) {
      throw new Error(`Invalid ImportedCell: ${fieldName} cannot be empty.`);
    }
  }

  /**
   * Validates that the cell value is a string while allowing an empty string.
   */
  private validateStringValue(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(
        `Invalid ImportedCell: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(`Invalid ImportedCell: ${fieldName} must be a string.`);
    }
  }
}
