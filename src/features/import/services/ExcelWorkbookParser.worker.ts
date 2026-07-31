import * as XLSX from "xlsx";
import { type ParsedWorkbook } from "../types/ParsedWorkbook";
import { type ParsedWorksheet } from "../types/ParsedWorksheet";
import {
  type ParseWorkbookRequest,
  type ParseWorkbookResponse,
} from "./ExcelWorkbookParser.worker.types";

function toCellString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function normalizeRow(values: readonly string[], columnCount: number): readonly string[] {
  if (values.length === columnCount) {
    return values;
  }

  return Array.from({ length: columnCount }, (_, index) => values[index] ?? "");
}

function parseWorksheet(sheetName: string, worksheet: XLSX.WorkSheet | undefined): ParsedWorksheet {
  if (!worksheet) {
    return {
      sheetName,
      headers: [],
      rows: [],
    };
  }

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: true,
  });

  const allRows = matrix.map((row) =>
    Array.isArray(row) ? row.map((value) => toCellString(value)) : [],
  );

  const headerRow = allRows[0] ?? [];
  const dataRows = allRows.slice(1);

  const columnCount = Math.max(
    headerRow.length,
    ...dataRows.map((row) => row.length),
    0,
  );

  return {
    sheetName,
    headers: normalizeRow(headerRow, columnCount),
    rows: dataRows.map((row) => normalizeRow(row, columnCount)),
  };
}

function parseWorkbook(workbookName: string, workbookData: ArrayBuffer): ParsedWorkbook {
  const workbook = XLSX.read(workbookData, {
    type: "array",
    cellText: true,
  });

  const worksheets = workbook.SheetNames.map((sheetName) =>
    parseWorksheet(sheetName, workbook.Sheets[sheetName]),
  );

  return {
    workbookName,
    worksheets,
  };
}

self.onmessage = (event: MessageEvent<ParseWorkbookRequest>) => {
  const request = event.data;

  if (request?.type !== "parse-workbook") {
    return;
  }

  try {
    const workbook = parseWorkbook(request.workbookName, request.workbookData);
    const response: ParseWorkbookResponse = {
      type: "parse-success",
      workbook,
    };
    self.postMessage(response);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Unable to parse the workbook.";

    const response: ParseWorkbookResponse = {
      type: "parse-error",
      message,
    };

    self.postMessage(response);
  }
};
