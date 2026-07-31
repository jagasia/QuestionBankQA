export type MappingSource = "auto" | "manual" | "saved" | "none";

export type ColumnMappingField =
  | "questionBody"
  | "optionA"
  | "optionB"
  | "optionC"
  | "optionD"
  | "difficulty"
  | "marks"
  | "topic";

export type AIGeneratedField =
  | "correctAnswer"
  | "correctAnswerPosition"
  | "questionBodyCorrections"
  | "optionCorrections"
  | "optionRelevance"
  | "printedBookReferenceOrExplanation"
  | "reviewerRemarks";

export interface ColumnMappingSelection {
  columnIndex: number | null;
  confidence: number | null;
  source: MappingSource;
}

export type ColumnMappingSelections = Record<ColumnMappingField, ColumnMappingSelection>;

export const REQUIRED_MAPPING_FIELDS: readonly ColumnMappingField[] = [
  "questionBody",
  "optionA",
  "optionB",
  "optionC",
  "optionD",
];

export const OPTIONAL_MAPPING_FIELDS: readonly ColumnMappingField[] = [
  "difficulty",
  "marks",
  "topic",
];

export const ALL_MAPPING_FIELDS: readonly ColumnMappingField[] = [
  ...REQUIRED_MAPPING_FIELDS,
  ...OPTIONAL_MAPPING_FIELDS,
];

export const MAPPING_FIELD_LABELS: Record<ColumnMappingField, string> = {
  questionBody: "Question Body",
  optionA: "Option A / Alternative1",
  optionB: "Option B / Alternative2",
  optionC: "Option C / Alternative3",
  optionD: "Option D / Alternative4",
  difficulty: "Difficulty (optional)",
  marks: "Marks (optional)",
  topic: "Topic (optional)",
};

export const AI_GENERATED_FIELD_LABELS: Record<AIGeneratedField, string> = {
  correctAnswer: "Correct Answer",
  correctAnswerPosition: "Correct Answer Position",
  questionBodyCorrections: "Question Body Corrections",
  optionCorrections: "Corrections to Options",
  optionRelevance: "Option Relevance / Multiple Answer Detection",
  printedBookReferenceOrExplanation: "Printed Book Reference / Explanation",
  reviewerRemarks: "Reviewer Remarks",
};

export const AI_GENERATED_FIELDS: readonly AIGeneratedField[] = [
  "correctAnswer",
  "correctAnswerPosition",
  "questionBodyCorrections",
  "optionCorrections",
  "optionRelevance",
  "printedBookReferenceOrExplanation",
  "reviewerRemarks",
];

const FIELD_ALIASES: Record<ColumnMappingField, readonly string[]> = {
  questionBody: ["question body", "question", "question text", "stem", "prompt"],
  optionA: ["option a", "optiona", "choice a", "a"],
  optionB: ["option b", "optionb", "choice b", "b"],
  optionC: ["option c", "optionc", "choice c", "c"],
  optionD: ["option d", "optiond", "choice d", "d"],
  difficulty: ["difficulty", "level", "complexity"],
  marks: ["marks", "score", "points", "weightage"],
  topic: ["topic", "subject", "chapter", "category", "domain"],
};

export function createEmptyMappingSelections(): ColumnMappingSelections {
  return {
    questionBody: { columnIndex: null, confidence: null, source: "none" },
    optionA: { columnIndex: null, confidence: null, source: "none" },
    optionB: { columnIndex: null, confidence: null, source: "none" },
    optionC: { columnIndex: null, confidence: null, source: "none" },
    optionD: { columnIndex: null, confidence: null, source: "none" },
    difficulty: { columnIndex: null, confidence: null, source: "none" },
    marks: { columnIndex: null, confidence: null, source: "none" },
    topic: { columnIndex: null, confidence: null, source: "none" },
  };
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

function tokenize(value: string): readonly string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function scoreHeaderMatch(header: string, alias: string): number {
  const normalizedHeader = normalizeText(header);
  const normalizedAlias = normalizeText(alias);

  if (normalizedHeader === normalizedAlias) {
    return 1;
  }

  if (normalizedHeader.includes(normalizedAlias) || normalizedAlias.includes(normalizedHeader)) {
    return 0.9;
  }

  const headerTokens = new Set(tokenize(header));
  const aliasTokens = new Set(tokenize(alias));
  const intersection = [...headerTokens].filter((token) => aliasTokens.has(token)).length;
  const union = new Set([...headerTokens, ...aliasTokens]).size;

  if (union === 0) {
    return 0;
  }

  return intersection / union;
}

function resolveBestHeader(
  headers: readonly string[],
  field: ColumnMappingField,
): { columnIndex: number | null; confidence: number } {
  let bestIndex: number | null = null;
  let bestScore = 0;

  headers.forEach((header, index) => {
    const score = FIELD_ALIASES[field].reduce((maxScore, alias) => {
      const candidateScore = scoreHeaderMatch(header, alias);
      return candidateScore > maxScore ? candidateScore : maxScore;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return {
    columnIndex: bestScore >= 0.45 ? bestIndex : null,
    confidence: bestScore,
  };
}

export function autoMapHeaders(headers: readonly string[]): ColumnMappingSelections {
  const result = createEmptyMappingSelections();

  ALL_MAPPING_FIELDS.forEach((field) => {
    const match = resolveBestHeader(headers, field);
    if (match.columnIndex !== null) {
      result[field] = {
        columnIndex: match.columnIndex,
        confidence: match.confidence,
        source: "auto",
      };
    }
  });

  return result;
}

export function areMandatoryMappingsComplete(
  selections: ColumnMappingSelections,
): boolean {
  return REQUIRED_MAPPING_FIELDS.every((field) => selections[field].columnIndex !== null);
}

export interface StoredColumnMapping {
  headersByField: Partial<Record<ColumnMappingField, string>>;
}

export function toStoredColumnMapping(
  selections: ColumnMappingSelections,
  headers: readonly string[],
): StoredColumnMapping {
  const headersByField: Partial<Record<ColumnMappingField, string>> = {};

  ALL_MAPPING_FIELDS.forEach((field) => {
    const columnIndex = selections[field].columnIndex;
    if (columnIndex !== null && headers[columnIndex] !== undefined) {
      headersByField[field] = headers[columnIndex];
    }
  });

  return { headersByField };
}

export function mapStoredHeadersToSelections(
  headers: readonly string[],
  stored: StoredColumnMapping,
): ColumnMappingSelections {
  const result = createEmptyMappingSelections();
  const normalizedHeaders = headers.map((header) => normalizeText(header));

  ALL_MAPPING_FIELDS.forEach((field) => {
    const storedHeader = stored.headersByField[field];
    if (!storedHeader) {
      return;
    }

    const index = normalizedHeaders.findIndex(
      (header) => header === normalizeText(storedHeader),
    );

    if (index >= 0) {
      result[field] = {
        columnIndex: index,
        confidence: 1,
        source: "saved",
      };
    }
  });

  return result;
}
