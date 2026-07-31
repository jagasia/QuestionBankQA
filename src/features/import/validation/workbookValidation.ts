import { type ParsedWorkbook } from "../types/ParsedWorkbook";
import {
  REQUIRED_MAPPING_FIELDS,
  type ColumnMappingSelections,
} from "./columnMapping";
import {
  type RowValidationIssue,
  type RowStatus,
  type ValidatedRow,
  type ValidatedWorksheet,
  type WorkbookValidationResult,
} from "./types";

interface ValidateWorksheetInput {
  workbook: ParsedWorkbook;
  worksheetName: string;
  mapping: ColumnMappingSelections;
  rowsOverride?: readonly (readonly string[])[];
}

function normalizeTextKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "").trim();
}

function normalizeNumberKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

function getCell(cells: readonly string[], index: number | null): string {
  if (index === null || index < 0 || index >= cells.length) {
    return "";
  }

  return cells[index] ?? "";
}

function getStatus(issues: readonly RowValidationIssue[]): RowStatus {
  if (issues.some((issue) => issue.severity === "error")) {
    return "error";
  }

  if (issues.some((issue) => issue.severity === "warning")) {
    return "warning";
  }

  return "valid";
}

function resolveQuestionNumberColumn(headers: readonly string[]): number | null {
  const aliases = [
    "question number",
    "question no",
    "question #",
    "q no",
    "qno",
    "id",
    "number",
  ];

  const normalizedHeaders = headers.map((header) => normalizeHeader(header));
  const normalizedAliases = aliases.map((alias) => normalizeHeader(alias));
  const index = normalizedHeaders.findIndex((header) => normalizedAliases.includes(header));

  return index >= 0 ? index : null;
}

interface WorkingRow {
  rowIndex: number;
  rowNumber: number;
  cells: readonly string[];
  issues: RowValidationIssue[];
  questionNumberValue: string;
  questionBodyValue: string;
}

function buildWorkingRows(
  worksheet: { rows: readonly (readonly string[])[]; headers: readonly string[] },
  mapping: ColumnMappingSelections,
): WorkingRow[] {
  const questionNumberColumnIndex = resolveQuestionNumberColumn(worksheet.headers);

  return worksheet.rows.map((cells, rowIndex) => {
    const issues: RowValidationIssue[] = [];

    const questionBodyValue = getCell(cells, mapping.questionBody.columnIndex).trim();
    const optionAValue = getCell(cells, mapping.optionA.columnIndex).trim();
    const optionBValue = getCell(cells, mapping.optionB.columnIndex).trim();
    const optionCValue = getCell(cells, mapping.optionC.columnIndex).trim();
    const optionDValue = getCell(cells, mapping.optionD.columnIndex).trim();
    const questionNumberValue = getCell(cells, questionNumberColumnIndex).trim();

    if (questionBodyValue.length === 0) {
      issues.push({
        code: "EMPTY_QUESTION",
        message: "Question Body is empty.",
        severity: "error",
      });
    }

    if (optionAValue.length === 0) {
      issues.push({
        code: "MISSING_OPTION_A",
        message: "Option A is required.",
        severity: "error",
      });
    }

    if (optionBValue.length === 0) {
      issues.push({
        code: "MISSING_OPTION_B",
        message: "Option B is required.",
        severity: "error",
      });
    }

    if (optionCValue.length === 0) {
      issues.push({
        code: "MISSING_OPTION_C",
        message: "Option C is required.",
        severity: "error",
      });
    }

    if (optionDValue.length === 0) {
      issues.push({
        code: "MISSING_OPTION_D",
        message: "Option D is required.",
        severity: "error",
      });
    }

    return {
      rowIndex,
      rowNumber: rowIndex + 2,
      cells,
      issues,
      questionNumberValue,
      questionBodyValue,
    };
  });
}

function applyDuplicateChecks(rows: WorkingRow[]): void {
  const questionNumberMap = new Map<string, WorkingRow[]>();
  const questionTextMap = new Map<string, WorkingRow[]>();

  rows.forEach((row) => {
    if (row.questionNumberValue.length > 0) {
      const numberKey = normalizeNumberKey(row.questionNumberValue);
      const numberMatches = questionNumberMap.get(numberKey) ?? [];
      numberMatches.push(row);
      questionNumberMap.set(numberKey, numberMatches);
    }

    if (row.questionBodyValue.length > 0) {
      const textKey = normalizeTextKey(row.questionBodyValue);
      if (textKey.length > 0) {
        const textMatches = questionTextMap.get(textKey) ?? [];
        textMatches.push(row);
        questionTextMap.set(textKey, textMatches);
      }
    }
  });

  questionNumberMap.forEach((matches, duplicateKey) => {
    if (matches.length <= 1) {
      return;
    }

    matches.forEach((row) => {
      row.issues.push({
        code: "DUPLICATE_QUESTION_NUMBER",
        message: `Duplicate Question Number detected: '${duplicateKey}'.`,
        severity: "warning",
      });
    });
  });

  questionTextMap.forEach((matches) => {
    if (matches.length <= 1) {
      return;
    }

    matches.forEach((row) => {
      row.issues.push({
        code: "DUPLICATE_QUESTION_TEXT",
        message: "Duplicate Question Body detected (case-insensitive and whitespace-insensitive).",
        severity: "warning",
      });
    });
  });
}

export function validateMappedWorksheet({
  workbook,
  worksheetName,
  mapping,
  rowsOverride,
}: ValidateWorksheetInput): WorkbookValidationResult {
  const worksheet = workbook.worksheets.find((item) => item.sheetName === worksheetName);

  if (!worksheet) {
    throw new Error(`Worksheet '${worksheetName}' not found in workbook.`);
  }

  const worksheetForValidation = {
    headers: worksheet.headers,
    rows: rowsOverride ?? worksheet.rows,
  };

  const workingRows = buildWorkingRows(worksheetForValidation, mapping);
  applyDuplicateChecks(workingRows);

  const validatedRows: ValidatedRow[] = workingRows.map((row) => ({
    sheetName: worksheet.sheetName,
    rowIndex: row.rowIndex,
    rowNumber: row.rowNumber,
    cells: row.cells,
    issues: row.issues,
    status: getStatus(row.issues),
  }));

  const validatedWorksheet: ValidatedWorksheet = {
    sheetName: worksheet.sheetName,
    headers: worksheet.headers,
    rows: validatedRows,
  };

  const warnings = validatedRows.reduce(
    (count, row) => count + row.issues.filter((issue) => issue.severity === "warning").length,
    0,
  );
  const errors = validatedRows.reduce(
    (count, row) => count + row.issues.filter((issue) => issue.severity === "error").length,
    0,
  );
  const duplicates = validatedRows.reduce(
    (count, row) => count + row.issues.filter((issue) => issue.code.startsWith("DUPLICATE_")).length,
    0,
  );
  const validationErrors = errors;
  const validRows = validatedRows.filter((row) => row.status === "valid").length;

  return {
    workbook,
    worksheets: [validatedWorksheet],
    summary: {
      totalRows: validatedRows.length,
      validRows,
      requiredInputFields: REQUIRED_MAPPING_FIELDS.length,
      aiFieldsToGenerate: 7,
      validationErrors,
      warnings,
      errors,
      duplicates,
    },
    hasErrors: errors > 0,
  };
}
