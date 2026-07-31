import { type ParsedWorkbook } from "../types/ParsedWorkbook";

export interface ParseWorkbookRequest {
  type: "parse-workbook";
  workbookName: string;
  workbookData: ArrayBuffer;
}

export interface ParseWorkbookSuccessResponse {
  type: "parse-success";
  workbook: ParsedWorkbook;
}

export interface ParseWorkbookErrorResponse {
  type: "parse-error";
  message: string;
}

export type ParseWorkbookResponse =
  | ParseWorkbookSuccessResponse
  | ParseWorkbookErrorResponse;
