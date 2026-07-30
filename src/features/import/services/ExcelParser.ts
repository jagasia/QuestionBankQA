import * as XLSX from "xlsx";
import { type ImportedQuestion } from "../types/ImportedQuestion";
import { type ImportedWorkbook } from "../types/ImportedWorkbook";

type QuestionColumnKey =
  | "question"
  | "optionA"
  | "optionB"
  | "optionC"
  | "optionD"
  | "correctAnswer"
  | "explanation";

type HeaderIndexMap = Record<QuestionColumnKey, number>;

/**
 * Parses Excel workbooks into ImportedQuestion records.
 */
export class ExcelParser {
  // Extend this map to support additional source header aliases over time.
  private static readonly HEADER_ALIASES: Record<QuestionColumnKey, string[]> = {
    question: ["question", "question text", "stem"],
    optionA: ["option a", "choice a", "answer a", "a"],
    optionB: ["option b", "choice b", "answer b", "b"],
    optionC: ["option c", "choice c", "answer c", "c"],
    optionD: ["option d", "choice d", "answer d", "d"],
    correctAnswer: ["correct answer", "answer", "correct option", "correct"],
    explanation: ["explanation", "rationale", "reason"],
  };

  parse(workbookData: ArrayBuffer): ImportedQuestion[] {
    return this.parseWorkbook(workbookData).rows;
  }

  parseWorkbook(workbookData: ArrayBuffer): ImportedWorkbook {
    const workbook = XLSX.read(workbookData, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return {
        sheetName: "",
        headers: [],
        rows: [],
      };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    if (!worksheet) {
      return {
        sheetName: firstSheetName,
        headers: [],
        rows: [],
      };
    }

    const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    if (rows.length === 0) {
      return {
        sheetName: firstSheetName,
        headers: [],
        rows: [],
      };
    }

    const headerRow = rows[0] ?? [];
    const headers = headerRow.map((value) => this.toCellString(value));
    const headerIndexMap = this.buildHeaderIndexMap(headerRow);
    const importedQuestions: ImportedQuestion[] = [];

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] ?? [];

      if (this.isCompletelyBlankRow(row)) {
        continue;
      }

      const explanation = this.getCellValue(row, headerIndexMap.explanation);

      importedQuestions.push({
        rowNumber: rowIndex + 1,
        question: this.getCellValue(row, headerIndexMap.question),
        optionA: this.getCellValue(row, headerIndexMap.optionA),
        optionB: this.getCellValue(row, headerIndexMap.optionB),
        optionC: this.getCellValue(row, headerIndexMap.optionC),
        optionD: this.getCellValue(row, headerIndexMap.optionD),
        correctAnswer: this.getCellValue(row, headerIndexMap.correctAnswer),
        explanation: explanation.trim() ? explanation : undefined,
        sourceSheet: firstSheetName,
      });
    }

    return {
      sheetName: firstSheetName,
      headers,
      rows: importedQuestions,
    };
  }

  private buildHeaderIndexMap(headerRow: unknown[]): HeaderIndexMap {
    const normalizedHeaders = headerRow.map((value) => this.normalizeHeader(value));

    const findHeaderIndex = (aliases: string[]): number => {
      const normalizedAliases = aliases.map((alias) => this.normalizeHeader(alias));
      return normalizedHeaders.findIndex((header) => normalizedAliases.includes(header));
    };

    return {
      question: findHeaderIndex(ExcelParser.HEADER_ALIASES.question),
      optionA: findHeaderIndex(ExcelParser.HEADER_ALIASES.optionA),
      optionB: findHeaderIndex(ExcelParser.HEADER_ALIASES.optionB),
      optionC: findHeaderIndex(ExcelParser.HEADER_ALIASES.optionC),
      optionD: findHeaderIndex(ExcelParser.HEADER_ALIASES.optionD),
      correctAnswer: findHeaderIndex(ExcelParser.HEADER_ALIASES.correctAnswer),
      explanation: findHeaderIndex(ExcelParser.HEADER_ALIASES.explanation),
    };
  }

  private getCellValue(row: unknown[], columnIndex: number): string {
    if (columnIndex < 0 || columnIndex >= row.length) {
      return "";
    }

    return this.toCellString(row[columnIndex]);
  }

  private isCompletelyBlankRow(row: unknown[]): boolean {
    return row.every((value) => this.toCellString(value).trim() === "");
  }

  private normalizeHeader(value: unknown): string {
    return this.toCellString(value)
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, " ");
  }

  private toCellString(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  }
}
