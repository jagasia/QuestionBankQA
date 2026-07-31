import { ImportedRow } from "./ImportedRow";

/**
 * Properties required to construct an immutable ImportedWorksheet.
 */
export interface ImportedWorksheetProps {
  sheetName: string;
  headers: readonly string[];
  rows: readonly ImportedRow[];
}

/**
 * Represents one worksheet parsed from an imported workbook.
 */
export class ImportedWorksheet {
  /** Worksheet name from the source workbook. */
  public readonly sheetName: string;

  private readonly headersValue: readonly string[];
  private readonly rowsValue: readonly ImportedRow[];

  /**
   * Creates a new immutable ImportedWorksheet.
   */
  constructor(props: ImportedWorksheetProps) {
    this.validate(props);

    this.sheetName = props.sheetName;
    this.headersValue = [...props.headers];
    this.rowsValue = [...props.rows];

    Object.freeze(this.headersValue);
    Object.freeze(this.rowsValue);
    Object.freeze(this);
  }

  /**
   * Returns a defensive copy of the header row.
   */
  public getHeaders(): readonly string[] {
    return [...this.headersValue];
  }

  /**
   * Returns a defensive copy of the parsed rows.
   */
  public getRows(): readonly ImportedRow[] {
    return [...this.rowsValue];
  }

  /**
   * Returns the number of parsed rows.
   */
  public getRowCount(): number {
    return this.rowsValue.length;
  }

  /**
   * Validates the worksheet properties before assignment.
   */
  private validate(props: ImportedWorksheetProps): void {
    if (props === null || props === undefined) {
      throw new Error(
        "Invalid ImportedWorksheet: props cannot be null or undefined.",
      );
    }

    this.validateNonEmptyString(props.sheetName, "sheetName");

    if (props.headers === null || props.headers === undefined) {
      throw new Error(
        "Invalid ImportedWorksheet: headers cannot be null or undefined.",
      );
    }

    if (props.rows === null || props.rows === undefined) {
      throw new Error("Invalid ImportedWorksheet: rows cannot be null or undefined.");
    }

    props.headers.forEach((header, index) => {
      if (header === null || header === undefined) {
        throw new Error(
          `Invalid ImportedWorksheet: headers[${index}] cannot be null or undefined.`,
        );
      }

      if (typeof header !== "string") {
        throw new Error(
          `Invalid ImportedWorksheet: headers[${index}] must be a string.`,
        );
      }
    });

    props.rows.forEach((row, index) => {
      if (row === null || row === undefined) {
        throw new Error(
          `Invalid ImportedWorksheet: rows[${index}] cannot be null or undefined.`,
        );
      }

      if (!(row instanceof ImportedRow)) {
        throw new Error(
          `Invalid ImportedWorksheet: rows[${index}] must be an ImportedRow.`,
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
        `Invalid ImportedWorksheet: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(
        `Invalid ImportedWorksheet: ${fieldName} must be a string.`,
      );
    }

    if (value.trim().length === 0) {
      throw new Error(`Invalid ImportedWorksheet: ${fieldName} cannot be empty.`);
    }
  }
}
