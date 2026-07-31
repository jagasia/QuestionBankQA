import { ImportedWorkbook } from "./models/ImportedWorkbook";
import { ColumnMapping } from "../../domain/templates/ColumnMapping";

/**
 * Extracts structural column mappings from a parsed workbook.
 *
 * This service is intentionally limited to workbook structure extraction and
 * does not perform semantic mapping, template detection, or persistence.
 */
export class MappingExtractionService {
  // TODO(architecture): ColumnMapping represents user-approved mappings, but
  // this service runs before approval. Replace these technical placeholders by
  // introducing a dedicated pre-approval structural mapping type.
  private static readonly STRUCTURAL_APPROVED_BY = "system:structural-extraction";
  private static readonly STRUCTURAL_CONFIDENCE = 0;
  private static readonly STRUCTURAL_APPROVED_AT = new Date(0);

  /**
   * Produces one ColumnMapping per worksheet header across the workbook.
   */
  public extract(workbook: ImportedWorkbook): readonly ColumnMapping[] {
    this.validateWorkbook(workbook);

    const mappings: ColumnMapping[] = [];
    const worksheets = workbook.getWorksheets();

    worksheets.forEach((worksheet) => {
      const headers = worksheet.getHeaders();

      headers.forEach((header, headerIndex) => {
        mappings.push(
          this.createMapping(
            worksheet.sheetName,
            header,
            headerIndex,
          ),
        );
      });
    });

    return mappings;
  }

  private validateWorkbook(workbook: ImportedWorkbook): void {
    if (workbook === null || workbook === undefined) {
      throw new Error(
        "Invalid MappingExtractionService input: workbook cannot be null or undefined.",
      );
    }

    if (!(workbook instanceof ImportedWorkbook)) {
      throw new Error(
        "Invalid MappingExtractionService input: workbook must be an ImportedWorkbook.",
      );
    }
  }

  private createMapping(
    sheetName: string,
    header: string,
    headerIndex: number,
  ): ColumnMapping {
    this.validateHeader(header, sheetName, headerIndex);

    return new ColumnMapping({
      id: this.createMappingId(sheetName, headerIndex),
      sourceColumn: header,
      canonicalField: header,
      confidence: MappingExtractionService.STRUCTURAL_CONFIDENCE,
      approvedBy: MappingExtractionService.STRUCTURAL_APPROVED_BY,
      approvedAt: MappingExtractionService.STRUCTURAL_APPROVED_AT,
    });
  }

  private createMappingId(sheetName: string, headerIndex: number): string {
    return `${sheetName}:column:${headerIndex + 1}`;
  }

  private validateHeader(
    header: string,
    sheetName: string,
    headerIndex: number,
  ): void {
    if (header === null || header === undefined) {
      throw new Error(
        `Invalid MappingExtractionService input: header at '${sheetName}' column ${headerIndex + 1} cannot be null or undefined.`,
      );
    }

    if (typeof header !== "string") {
      throw new Error(
        `Invalid MappingExtractionService input: header at '${sheetName}' column ${headerIndex + 1} must be a string.`,
      );
    }

    if (header.trim().length === 0) {
      throw new Error(
        `Invalid MappingExtractionService input: header at '${sheetName}' column ${headerIndex + 1} cannot be empty.`,
      );
    }
  }
}