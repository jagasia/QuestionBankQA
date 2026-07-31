import { type ParsedWorkbook } from "../types/ParsedWorkbook";

export type ValidationSeverity = "warning" | "error";
export type RowStatus = "valid" | "warning" | "error";

export interface RowValidationIssue {
  code: string;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidatedRow {
  sheetName: string;
  rowIndex: number;
  rowNumber: number;
  cells: readonly string[];
  issues: readonly RowValidationIssue[];
  status: RowStatus;
}

export interface ValidatedWorksheet {
  sheetName: string;
  headers: readonly string[];
  rows: readonly ValidatedRow[];
}

export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  requiredInputFields: number;
  aiFieldsToGenerate: number;
  validationErrors: number;
  warnings: number;
  errors: number;
  duplicates: number;
}

export interface WorkbookValidationResult {
  workbook: ParsedWorkbook;
  worksheets: readonly ValidatedWorksheet[];
  summary: ValidationSummary;
  hasErrors: boolean;
}
