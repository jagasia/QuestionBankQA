import { type ParsedWorksheet } from "./ParsedWorksheet";

/**
 * Generic workbook structure imported from an Excel file.
 */
export interface ParsedWorkbook {
  /** Uploaded file name for display and traceability in the UI. */
  workbookName: string;

  /** Every parsed worksheet from the workbook in source order. */
  worksheets: readonly ParsedWorksheet[];
}
