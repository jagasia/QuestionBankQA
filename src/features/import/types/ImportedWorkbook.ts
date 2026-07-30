import { type ImportedQuestion } from "./ImportedQuestion";

/**
 * Raw workbook content captured directly from an imported Excel sheet.
 */
export interface ImportedWorkbook {
  /** Name of the worksheet that was imported. */
  sheetName: string;

  /** Header values found in the worksheet header row. */
  headers: string[];

  /** Parsed worksheet rows in their imported shape. */
  rows: ImportedQuestion[];
}
