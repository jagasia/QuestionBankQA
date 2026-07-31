import { ImportedCell } from "./ImportedCell";

/**
 * Properties required to construct an immutable ImportedRow.
 */
export interface ImportedRowProps {
  rowNumber: number;
  cells: readonly ImportedCell[];
}

/**
 * Represents one logical row parsed from a worksheet.
 */
export class ImportedRow {
  /** One-based row number from the source worksheet. */
  public readonly rowNumber: number;

  private readonly cellsValue: readonly ImportedCell[];

  /**
   * Creates a new immutable ImportedRow.
   */
  constructor(props: ImportedRowProps) {
    this.validate(props);

    this.rowNumber = props.rowNumber;
    this.cellsValue = [...props.cells];

    Object.freeze(this.cellsValue);
    Object.freeze(this);
  }

  /**
   * Returns a defensive copy of all parsed cells in this row.
   */
  public getCells(): readonly ImportedCell[] {
    return [...this.cellsValue];
  }

  /**
   * Returns the cell for the provided column name, or undefined when absent.
   */
  public getCell(columnName: string): ImportedCell | undefined {
    this.validateNonEmptyString(columnName, "columnName");

    return this.cellsValue.find((cell) => cell.columnName === columnName);
  }

  /**
   * Returns true when a cell exists for the provided column name.
   */
  public hasCell(columnName: string): boolean {
    this.validateNonEmptyString(columnName, "columnName");

    return this.getCell(columnName) !== undefined;
  }

  /**
   * Validates the row properties before assignment.
   */
  private validate(props: ImportedRowProps): void {
    if (props === null || props === undefined) {
      throw new Error(
        "Invalid ImportedRow: props cannot be null or undefined.",
      );
    }

    if (!Number.isInteger(props.rowNumber) || props.rowNumber < 1) {
      throw new Error(
        "Invalid ImportedRow: rowNumber must be an integer greater than or equal to 1.",
      );
    }

    if (props.cells === null || props.cells === undefined) {
      throw new Error("Invalid ImportedRow: cells cannot be null or undefined.");
    }

    props.cells.forEach((cell, index) => {
      if (cell === null || cell === undefined) {
        throw new Error(
          `Invalid ImportedRow: cells[${index}] cannot be null or undefined.`,
        );
      }

      if (!(cell instanceof ImportedCell)) {
        throw new Error(
          `Invalid ImportedRow: cells[${index}] must be an ImportedCell.`,
        );
      }
    });
  }

  /**
   * Validates that a required string input is present and non-empty.
   */
  private validateNonEmptyString(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(
        `Invalid ImportedRow: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(`Invalid ImportedRow: ${fieldName} must be a string.`);
    }

    if (value.trim().length === 0) {
      throw new Error(`Invalid ImportedRow: ${fieldName} cannot be empty.`);
    }
  }
}
