import { ExcelWorkbookParser } from "./ExcelWorkbookParser";
import { type ParsedWorkbook } from "../types/ParsedWorkbook";

/**
 * Service layer for importing and parsing uploaded Excel files.
 */
export class ExcelImportService {
  constructor(
    private readonly workbookParser: ExcelWorkbookParser = new ExcelWorkbookParser(),
  ) {}

  async importWorkbook(file: File): Promise<ParsedWorkbook> {
    const workbookData = await file.arrayBuffer();
    return this.workbookParser.parse(workbookData, file.name);
  }
}
