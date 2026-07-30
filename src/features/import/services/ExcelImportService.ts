import { ExcelParser } from "./ExcelParser";
import { type ImportedQuestion } from "../types/ImportedQuestion";
import { type ImportedWorkbook } from "../types/ImportedWorkbook";

/**
 * Service layer for importing and parsing uploaded Excel files.
 */
export class ExcelImportService {
  constructor(private readonly excelParser: ExcelParser = new ExcelParser()) {}

  async importWorkbook(file: File): Promise<ImportedWorkbook> {
    const workbookData = await file.arrayBuffer();
    return this.excelParser.parseWorkbook(workbookData);
  }

  async import(file: File): Promise<ImportedQuestion[]> {
    const workbook = await this.importWorkbook(file);
    return workbook.rows;
  }
}
