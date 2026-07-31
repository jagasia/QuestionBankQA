import { ImportedWorksheet } from "./ImportedWorksheet";

/**
 * Properties required to construct an immutable ImportedWorkbook.
 */
export interface ImportedWorkbookProps {
  workbookName: string;
  worksheets: readonly ImportedWorksheet[];
}

/**
 * Represents the parsed workbook returned by the application layer.
 */
export class ImportedWorkbook {
  /** Workbook name derived from the uploaded file. */
  public readonly workbookName: string;

  private readonly worksheetsValue: readonly ImportedWorksheet[];

  /**
   * Creates a new immutable ImportedWorkbook.
   */
  constructor(props: ImportedWorkbookProps) {
    this.validate(props);

    this.workbookName = props.workbookName;
    this.worksheetsValue = [...props.worksheets];

    Object.freeze(this.worksheetsValue);
    Object.freeze(this);
  }

  /**
   * Returns a defensive copy of all parsed worksheets.
   */
  public getWorksheets(): readonly ImportedWorksheet[] {
    return [...this.worksheetsValue];
  }

  /**
   * Returns the worksheet with the provided name, or undefined when absent.
   */
  public getWorksheet(name: string): ImportedWorksheet | undefined {
    this.validateNonEmptyString(name, "name");

    return this.worksheetsValue.find((worksheet) => worksheet.sheetName === name);
  }

  /**
   * Returns true when a worksheet with the provided name exists.
   */
  public hasWorksheet(name: string): boolean {
    this.validateNonEmptyString(name, "name");

    return this.getWorksheet(name) !== undefined;
  }

  /**
   * Validates the workbook properties before assignment.
   */
  private validate(props: ImportedWorkbookProps): void {
    if (props === null || props === undefined) {
      throw new Error(
        "Invalid ImportedWorkbook: props cannot be null or undefined.",
      );
    }

    this.validateNonEmptyString(props.workbookName, "workbookName");

    if (props.worksheets === null || props.worksheets === undefined) {
      throw new Error(
        "Invalid ImportedWorkbook: worksheets cannot be null or undefined.",
      );
    }

    if (props.worksheets.length === 0) {
      throw new Error(
        "Invalid ImportedWorkbook: worksheets must contain at least one worksheet.",
      );
    }

    props.worksheets.forEach((worksheet, index) => {
      if (worksheet === null || worksheet === undefined) {
        throw new Error(
          `Invalid ImportedWorkbook: worksheets[${index}] cannot be null or undefined.`,
        );
      }

      if (!(worksheet instanceof ImportedWorksheet)) {
        throw new Error(
          `Invalid ImportedWorkbook: worksheets[${index}] must be an ImportedWorksheet.`,
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
        `Invalid ImportedWorkbook: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(
        `Invalid ImportedWorkbook: ${fieldName} must be a string.`,
      );
    }

    if (value.trim().length === 0) {
      throw new Error(
        `Invalid ImportedWorkbook: ${fieldName} cannot be empty.`,
      );
    }
  }
}
