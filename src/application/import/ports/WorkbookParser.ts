import { ImportedWorkbook } from "../models/ImportedWorkbook";
import { UploadedWorkbook } from "../models/UploadedWorkbook";

/**
 * Application port that defines the workbook parsing contract.
 *
 * Infrastructure-specific implementations convert an uploaded workbook source
 * into the immutable application workbook model.
 */
export interface WorkbookParser {
  /**
   * Parses the provided workbook source into the application workbook model.
   */
  parse(workbook: UploadedWorkbook): ImportedWorkbook;
}
