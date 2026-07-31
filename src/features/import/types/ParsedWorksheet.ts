/**
 * Generic worksheet data imported from an uploaded workbook.
 */
export interface ParsedWorksheet {
  /** Worksheet name exactly as it appears in the workbook. */
  sheetName: string;

  /** Header row values, preserving empty cells as empty strings. */
  headers: readonly string[];

  /** All data rows after the header row, preserving empty cells. */
  rows: readonly (readonly string[])[];
}
