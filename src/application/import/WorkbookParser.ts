import * as XLSX from "xlsx";
import { ColumnMapping } from "../../domain/templates/ColumnMapping";

/**
 * Parses an uploaded Excel workbook into ColumnMapping domain objects.
 *
 * This parser reads workbook structure only and does not perform template
 * detection, fingerprint generation, persistence, or workflow orchestration.
 */
export class WorkbookParser {
  private static readonly PARSER_APPROVER = "workbook-parser";
  private static readonly PARSER_CONFIDENCE = 1;
  private static readonly PARSER_APPROVED_AT = new Date(0);

  /**
   * Parses the first worksheet and returns one ColumnMapping per header column.
   */
  public parse(workbookData: ArrayBuffer): readonly ColumnMapping[] {
    this.validateWorkbookData(workbookData);

    const workbook = XLSX.read(workbookData, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return [];
    }

    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      return [];
    }

    const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    if (rows.length === 0) {
      return [];
    }

    const headerRow = rows[0] ?? [];

    return headerRow.map((headerValue, index) =>
      this.createColumnMapping(firstSheetName, headerValue, index),
    );
  }

  /**
   * Validates the incoming workbook payload before parsing.
   */
  private validateWorkbookData(workbookData: ArrayBuffer): void {
    if (workbookData === null || workbookData === undefined) {
      throw new Error(
        "Invalid WorkbookParser input: workbookData cannot be null or undefined.",
      );
    }

    if (!(workbookData instanceof ArrayBuffer)) {
      throw new Error(
        "Invalid WorkbookParser input: workbookData must be an ArrayBuffer.",
      );
    }
  }

  /**
   * Creates a ColumnMapping from a single worksheet header value.
   */
  private createColumnMapping(
    sheetName: string,
    headerValue: unknown,
    columnIndex: number,
  ): ColumnMapping {
    const sourceColumn = this.toCellString(headerValue);

    if (sourceColumn.trim().length === 0) {
      throw new Error(
        `Invalid WorkbookParser input: header at column index ${columnIndex} cannot be empty.`,
      );
    }

    const mappingId = this.createMappingId(sheetName, columnIndex);

    return new ColumnMapping({
      id: mappingId,
      sourceColumn,
      canonicalField: sourceColumn,
      confidence: WorkbookParser.PARSER_CONFIDENCE,
      approvedBy: WorkbookParser.PARSER_APPROVER,
      approvedAt: WorkbookParser.PARSER_APPROVED_AT,
    });
  }

  /**
   * Builds a deterministic mapping identifier from worksheet and column index.
   */
  private createMappingId(sheetName: string, columnIndex: number): string {
    return `${sheetName}:column:${columnIndex + 1}`;
  }

  /**
   * Converts worksheet cell values into strings for header processing.
   */
  private toCellString(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  }
}
