import { type ImportedQuestion } from "../types/ImportedQuestion";
import { type ImportedWorkbook } from "../types/ImportedWorkbook";
import { type PromptData } from "./types/PromptData";

const SAMPLE_ROW_LIMIT = 5;

/**
 * Builds structured prompt data from an ImportedWorkbook.
 */
export class PromptDataBuilder {
  private static readonly CANONICAL_FIELDS = [
    "question",
    "optionA",
    "optionB",
    "optionC",
    "optionD",
    "correctAnswer",
    "explanation",
  ];

  private static readonly REQUIRED_OUTPUT = JSON.stringify(
    {
      templateName: "...",
      detectedMappings: {},
      additionalColumns: [],
      confidenceScore: 0.98,
      reasoning: "...",
    },
    null,
    2,
  );

  buildTemplateDetectionData(workbook: ImportedWorkbook): PromptData {
    const workbookMetadata = [
      "Worksheet:",
      workbook.sheetName,
      "",
      "Rows:",
      String(workbook.rows.length),
      "",
      "Columns:",
      String(workbook.headers.length),
    ].join("\n");

    const sampleRows = workbook.rows
      .filter((row) => this.isNonEmptyRow(row))
      .slice(0, SAMPLE_ROW_LIMIT);

    return {
      workbookMetadata,
      headers: workbook.headers,
      sampleRows,
      canonicalFields: PromptDataBuilder.CANONICAL_FIELDS,
      requiredOutput: PromptDataBuilder.REQUIRED_OUTPUT,
    };
  }

  private isNonEmptyRow(row: ImportedQuestion): boolean {
    const values = [
      row.question,
      row.optionA,
      row.optionB,
      row.optionC,
      row.optionD,
      row.correctAnswer,
      row.explanation ?? "",
    ];

    return values.some((value) => value.trim().length > 0);
  }
}
