"use client";

import * as React from "react";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExcelImportService } from "@/features/import/services/ExcelImportService";
import { type ParsedWorkbook } from "@/features/import/types/ParsedWorkbook";
import { MockAIProvider } from "@/features/import/ai/providers/MockAIProvider";
import {
  QuestionReviewEngine,
  type QuestionReviewResult,
} from "@/features/import/ai/QuestionReviewEngine";
import { QuestionStatus } from "@/features/import/lifecycle/QuestionStatus";
import {
  QuestionLifecycleService,
  type QuestionLifecycleRecord,
  type QuestionStatusHistoryEntry,
  type QuestionLifecycleMap,
} from "@/features/import/lifecycle/QuestionLifecycleService";
import {
  HumanReviewAction,
  HumanReviewService,
  type HumanReviewEntry,
  type HumanReviewMap,
} from "@/features/import/review/HumanReviewService";
import {
  AI_GENERATED_FIELDS,
  AI_GENERATED_FIELD_LABELS,
  ALL_MAPPING_FIELDS,
  MAPPING_FIELD_LABELS,
  REQUIRED_MAPPING_FIELDS,
  areMandatoryMappingsComplete,
  autoMapHeaders,
  createEmptyMappingSelections,
  mapStoredHeadersToSelections,
  toStoredColumnMapping,
  type ColumnMappingField,
  type ColumnMappingSelections,
} from "@/features/import/validation/columnMapping";
import { validateMappedWorksheet } from "@/features/import/validation/workbookValidation";
import {
  type RowValidationIssue,
  type RowStatus,
  type ValidatedRow,
} from "@/features/import/validation/types";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".xlsx"];
const STORAGE_KEY_PREFIX = "qbqa:column-mapping:v1";
const REVIEW_PROGRESS_STORAGE_PREFIX = "qbqa:ai-review-progress:v1";

const AI_HEADER_ALIASES = {
  correctAnswer: ["correct answer", "answer", "correct option"],
  correctAnswerPosition: ["correct answer position", "answer position", "correct position"],
  questionBodyCorrections: ["question body corrections", "question corrections", "question correction"],
  optionCorrections: ["corrections to options", "option corrections", "option correction"],
  optionRelevance: ["option relevance", "multiple answer detection", "multiple answers"],
  printedBookReferenceOrExplanation: [
    "printed book reference / explanation",
    "printed book reference",
    "explanation",
    "reference",
  ],
  reviewerRemarks: ["reviewer remarks", "remarks", "review remarks"],
} as const;

type RowFilter = "all" | "valid" | "warnings" | "errors" | "duplicates";
type StatusFilter = "all" | QuestionStatus;

function getStatusLabel(status: RowStatus): string {
  switch (status) {
    case "valid":
      return "Valid";
    case "warning":
      return "Warning";
    default:
      return "Error";
  }
}

function getStatusBadgeVariant(status: RowStatus): "secondary" | "destructive" | "default" {
  switch (status) {
    case "valid":
      return "default";
    case "warning":
      return "secondary";
    default:
      return "destructive";
  }
}

function getRowClassName(status: RowStatus): string {
  switch (status) {
    case "error":
      return "cursor-pointer bg-destructive/10 hover:bg-destructive/15";
    case "warning":
      return "cursor-pointer bg-amber-100/50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20";
    default:
      return "cursor-pointer";
  }
}

function matchesFilter(row: ValidatedRow, filter: RowFilter): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "valid") {
    return row.status === "valid";
  }

  if (filter === "warnings") {
    return row.status === "warning";
  }

  if (filter === "errors") {
    return row.status === "error";
  }

  return row.issues.some((issue) => issue.code.startsWith("DUPLICATE_"));
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

function buildMappingStorageKey(sheetName: string, headers: readonly string[]): string {
  const normalizedHeaderSignature = headers
    .map((header) => normalizeHeader(header))
    .join("|");

  return `${STORAGE_KEY_PREFIX}:${normalizeHeader(sheetName)}:${normalizedHeaderSignature}`;
}

function buildReviewProgressStorageKey(
  workbookName: string,
  sheetName: string,
  headers: readonly string[],
): string {
  const headerSignature = headers.map((header) => normalizeHeader(header)).join("|");
  return `${REVIEW_PROGRESS_STORAGE_PREFIX}:${normalizeHeader(workbookName)}:${normalizeHeader(sheetName)}:${headerSignature}`;
}

interface AIReviewRecord {
  generatedAt: string;
  result: QuestionReviewResult;
}

type AIReviewMap = Record<string, AIReviewRecord>;

interface PersistedReviewProgress {
  editedRows: readonly (readonly string[])[];
  questionLifecycleMap: Record<string, {
    rowKey: string;
    currentStatus: QuestionStatus;
    history: Array<{ status: QuestionStatus; changedAt: string }>;
  }>;
  aiReviewMap: AIReviewMap;
  humanReviewMap: Record<string, {
    rowKey: string;
    latest: {
      action: HumanReviewAction;
      reviewedBy: string;
      reviewedOn: string;
      comments: string;
      resultingStatus: QuestionStatus;
    };
    history: Array<{
      action: HumanReviewAction;
      reviewedBy: string;
      reviewedOn: string;
      comments: string;
      resultingStatus: QuestionStatus;
    }>;
  }>;
  processedCount: number;
}

function serializeLifecycleMap(
  lifecycleMap: QuestionLifecycleMap,
): PersistedReviewProgress["questionLifecycleMap"] {
  const serialized: PersistedReviewProgress["questionLifecycleMap"] = {};

  Object.entries(lifecycleMap).forEach(([rowKey, record]) => {
    serialized[rowKey] = {
      rowKey: record.rowKey,
      currentStatus: record.currentStatus,
      history: record.history.map((entry) => ({
        status: entry.status,
        changedAt: entry.changedAt.toISOString(),
      })),
    };
  });

  return serialized;
}

function deserializeLifecycleMap(
  serialized: PersistedReviewProgress["questionLifecycleMap"],
): QuestionLifecycleMap {
  const map: QuestionLifecycleMap = {};

  Object.entries(serialized).forEach(([rowKey, record]) => {
    const history: QuestionStatusHistoryEntry[] = record.history.map((entry) => ({
      status: entry.status,
      changedAt: new Date(entry.changedAt),
    }));

    const lifecycleRecord: QuestionLifecycleRecord = {
      rowKey: record.rowKey,
      currentStatus: record.currentStatus,
      history,
    };

    map[rowKey] = lifecycleRecord;
  });

  return map;
}

function serializeHumanReviewMap(
  reviewMap: HumanReviewMap,
): PersistedReviewProgress["humanReviewMap"] {
  const serialized: PersistedReviewProgress["humanReviewMap"] = {};

  Object.entries(reviewMap).forEach(([rowKey, record]) => {
    serialized[rowKey] = {
      rowKey: record.rowKey,
      latest: {
        action: record.latest.action,
        reviewedBy: record.latest.reviewedBy,
        reviewedOn: record.latest.reviewedOn.toISOString(),
        comments: record.latest.comments,
        resultingStatus: record.latest.resultingStatus,
      },
      history: record.history.map((entry) => ({
        action: entry.action,
        reviewedBy: entry.reviewedBy,
        reviewedOn: entry.reviewedOn.toISOString(),
        comments: entry.comments,
        resultingStatus: entry.resultingStatus,
      })),
    };
  });

  return serialized;
}

function deserializeHumanReviewMap(
  serialized: PersistedReviewProgress["humanReviewMap"],
): HumanReviewMap {
  const restored: HumanReviewMap = {};

  Object.entries(serialized).forEach(([rowKey, record]) => {
    const history: HumanReviewEntry[] = record.history.map((entry) => ({
      action: entry.action,
      reviewedBy: entry.reviewedBy,
      reviewedOn: new Date(entry.reviewedOn),
      comments: entry.comments,
      resultingStatus: entry.resultingStatus,
    }));

    const latest: HumanReviewEntry = {
      action: record.latest.action,
      reviewedBy: record.latest.reviewedBy,
      reviewedOn: new Date(record.latest.reviewedOn),
      comments: record.latest.comments,
      resultingStatus: record.latest.resultingStatus,
    };

    restored[rowKey] = {
      rowKey,
      latest,
      history,
    };
  });

  return restored;
}

function mergeMappings(
  base: ColumnMappingSelections,
  override: ColumnMappingSelections,
): ColumnMappingSelections {
  return {
    questionBody: override.questionBody.columnIndex !== null ? override.questionBody : base.questionBody,
    optionA: override.optionA.columnIndex !== null ? override.optionA : base.optionA,
    optionB: override.optionB.columnIndex !== null ? override.optionB : base.optionB,
    optionC: override.optionC.columnIndex !== null ? override.optionC : base.optionC,
    optionD: override.optionD.columnIndex !== null ? override.optionD : base.optionD,
    difficulty: override.difficulty.columnIndex !== null ? override.difficulty : base.difficulty,
    marks: override.marks.columnIndex !== null ? override.marks : base.marks,
    topic: override.topic.columnIndex !== null ? override.topic : base.topic,
  };
}

function confidenceToPercentage(confidence: number | null): string {
  if (confidence === null) {
    return "";
  }

  return `${Math.round(confidence * 100)}%`;
}

function getRowLifecycleKey(sheetName: string, rowIndex: number): string {
  return `${sheetName}::${rowIndex}`;
}

function getLifecycleBadgeClassName(status: QuestionStatus): string {
  switch (status) {
    case QuestionStatus.Imported:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
    case QuestionStatus.PendingAIReview:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case QuestionStatus.AIReviewed:
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300";
    case QuestionStatus.NeedsHumanReview:
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case QuestionStatus.Approved:
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case QuestionStatus.Rejected:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    case QuestionStatus.Published:
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    default:
      return "";
  }
}

interface ReviewFieldSnapshot {
  key: string;
  label: string;
  value: string;
}

export default function ImportPage() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const excelImportService = React.useMemo(() => new ExcelImportService(), []);
  const questionReviewEngine = React.useMemo(
    () => new QuestionReviewEngine(new MockAIProvider()),
    [],
  );
  const lifecycleService = React.useMemo(() => new QuestionLifecycleService(), []);
  const humanReviewService = React.useMemo(() => new HumanReviewService(), []);
  const allLifecycleStatuses = React.useMemo(
    () => lifecycleService.getAllStatuses(),
    [lifecycleService],
  );

  const [selectedFileName, setSelectedFileName] = React.useState("");
  const [validationMessage, setValidationMessage] = React.useState<string | null>(null);
  const [workbook, setWorkbook] = React.useState<ParsedWorkbook | null>(null);
  const [selectedWorksheetName, setSelectedWorksheetName] = React.useState<string>("");
  const [mappingSelections, setMappingSelections] = React.useState<ColumnMappingSelections>(
    createEmptyMappingSelections(),
  );
  const [mappingConfirmed, setMappingConfirmed] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<RowFilter>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [questionLifecycleMap, setQuestionLifecycleMap] = React.useState<QuestionLifecycleMap>({});
  const [aiReviewMap, setAiReviewMap] = React.useState<AIReviewMap>({});
  const [humanReviewMap, setHumanReviewMap] = React.useState<HumanReviewMap>({});
  const [reviewedByInput, setReviewedByInput] = React.useState("");
  const [reviewCommentsInput, setReviewCommentsInput] = React.useState("");
  const [isReviewRunning, setIsReviewRunning] = React.useState(false);
  const [reviewProgress, setReviewProgress] = React.useState({
    processed: 0,
    total: 0,
    currentRowNumber: 0,
  });
  const [editedRows, setEditedRows] = React.useState<readonly (readonly string[])[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = React.useState<number | null>(null);
  const [selectedLifecycleStatus, setSelectedLifecycleStatus] = React.useState<QuestionStatus>(
    QuestionStatus.Imported,
  );
  const [optionPasteInput, setOptionPasteInput] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const editorRefs = React.useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const reviewCancelRequestedRef = React.useRef(false);

  const isBusy = isProcessing || isPending;

  const selectedWorksheet = React.useMemo(() => {
    if (!workbook || selectedWorksheetName.length === 0) {
      return undefined;
    }

    return workbook.worksheets.find((worksheet) => worksheet.sheetName === selectedWorksheetName);
  }, [workbook, selectedWorksheetName]);

  const aiFieldColumnIndexes = React.useMemo(() => {
    if (!selectedWorksheet) {
      return {
        correctAnswer: null,
        correctAnswerPosition: null,
        questionBodyCorrections: null,
        optionCorrections: null,
        optionRelevance: null,
        printedBookReferenceOrExplanation: null,
        reviewerRemarks: null,
      } as Record<keyof typeof AI_HEADER_ALIASES, number | null>;
    }

    const normalizedHeaders = selectedWorksheet.headers.map((header) => normalizeHeader(header));

    const findIndex = (aliases: readonly string[]): number | null => {
      const normalizedAliases = aliases.map((alias) => normalizeHeader(alias));
      const index = normalizedHeaders.findIndex((header) => normalizedAliases.includes(header));
      return index >= 0 ? index : null;
    };

    return {
      correctAnswer: findIndex(AI_HEADER_ALIASES.correctAnswer),
      correctAnswerPosition: findIndex(AI_HEADER_ALIASES.correctAnswerPosition),
      questionBodyCorrections: findIndex(AI_HEADER_ALIASES.questionBodyCorrections),
      optionCorrections: findIndex(AI_HEADER_ALIASES.optionCorrections),
      optionRelevance: findIndex(AI_HEADER_ALIASES.optionRelevance),
      printedBookReferenceOrExplanation: findIndex(AI_HEADER_ALIASES.printedBookReferenceOrExplanation),
      reviewerRemarks: findIndex(AI_HEADER_ALIASES.reviewerRemarks),
    };
  }, [selectedWorksheet]);

  const mandatoryMappingComplete = React.useMemo(
    () => areMandatoryMappingsComplete(mappingSelections),
    [mappingSelections],
  );

  const validationResult = React.useMemo(() => {
    if (!workbook || !selectedWorksheet || !mappingConfirmed || !mandatoryMappingComplete) {
      return null;
    }

    return validateMappedWorksheet({
      workbook,
      worksheetName: selectedWorksheet.sheetName,
      mapping: mappingSelections,
      rowsOverride: editedRows,
    });
  }, [
    workbook,
    selectedWorksheet,
    mappingConfirmed,
    mandatoryMappingComplete,
    mappingSelections,
    editedRows,
  ]);

  const selectedRow = React.useMemo(() => {
    if (selectedRowIndex === null || !validationResult) {
      return null;
    }

    return validationResult.worksheets[0]?.rows.find((row) => row.rowIndex === selectedRowIndex) ?? null;
  }, [selectedRowIndex, validationResult]);

  const issueRowIndexes = React.useMemo(() => {
    if (!validationResult) {
      return [] as number[];
    }

    return validationResult.worksheets[0].rows
      .filter((row) => row.issues.length > 0)
      .map((row) => row.rowIndex);
  }, [validationResult]);

  const selectedIssueRowPosition = React.useMemo(() => {
    if (selectedRowIndex === null) {
      return -1;
    }

    return issueRowIndexes.findIndex((index) => index === selectedRowIndex);
  }, [issueRowIndexes, selectedRowIndex]);

  const selectedRowLifecycle = React.useMemo(() => {
    if (!selectedRow) {
      return null;
    }

    const rowKey = getRowLifecycleKey(selectedRow.sheetName, selectedRow.rowIndex);
    return questionLifecycleMap[rowKey] ?? null;
  }, [selectedRow, questionLifecycleMap]);

  const selectedRowKey = React.useMemo(() => {
    if (!selectedRow) {
      return null;
    }

    return getRowLifecycleKey(selectedRow.sheetName, selectedRow.rowIndex);
  }, [selectedRow]);

  const selectedRowHumanReview = React.useMemo(() => {
    if (!selectedRowKey) {
      return null;
    }

    return humanReviewMap[selectedRowKey] ?? null;
  }, [selectedRowKey, humanReviewMap]);

  React.useEffect(() => {
    if (!workbook || workbook.worksheets.length === 0) {
      setSelectedWorksheetName("");
      setMappingSelections(createEmptyMappingSelections());
      setMappingConfirmed(false);
      setEditedRows([]);
      setQuestionLifecycleMap({});
      setHumanReviewMap({});
      setStatusFilter("all");
      return;
    }

    setSelectedWorksheetName(workbook.worksheets[0].sheetName);
  }, [workbook]);

  React.useEffect(() => {
    if (!selectedWorksheet) {
      setMappingSelections(createEmptyMappingSelections());
      setMappingConfirmed(false);
      return;
    }

    const autoMapped = autoMapHeaders(selectedWorksheet.headers);
    let finalMapping = autoMapped;

    try {
      const storageKey = buildMappingStorageKey(
        selectedWorksheet.sheetName,
        selectedWorksheet.headers,
      );
      const savedValue = window.localStorage.getItem(storageKey);

      if (savedValue) {
        const savedMapping = JSON.parse(savedValue) as {
          headersByField?: Record<string, string>;
        };

        if (savedMapping.headersByField) {
          const restored = mapStoredHeadersToSelections(selectedWorksheet.headers, {
            headersByField: savedMapping.headersByField,
          });
          finalMapping = mergeMappings(autoMapped, restored);
        }
      }
    } catch {
      // Ignore storage read errors and continue with auto-mapped values.
    }

    setMappingSelections(finalMapping);
    setMappingConfirmed(false);
    const defaultEditedRows = selectedWorksheet.rows.map((row) => [...row]);
    let nextEditedRows: readonly (readonly string[])[] = defaultEditedRows;
    let nextLifecycleMap = lifecycleService.initializeForRows(
      selectedWorksheet.rows.map((_, rowIndex) => getRowLifecycleKey(selectedWorksheet.sheetName, rowIndex)),
      {},
    );
    let nextReviewMap: AIReviewMap = {};
    let nextHumanReviewMap: HumanReviewMap = {};
    let nextProcessedCount = 0;

    if (workbook) {
      try {
        const reviewStorageKey = buildReviewProgressStorageKey(
          workbook.workbookName,
          selectedWorksheet.sheetName,
          selectedWorksheet.headers,
        );
        const persistedRaw = window.localStorage.getItem(reviewStorageKey);

        if (persistedRaw) {
          const persisted = JSON.parse(persistedRaw) as PersistedReviewProgress;
          if (Array.isArray(persisted.editedRows) && persisted.editedRows.length === selectedWorksheet.rows.length) {
            nextEditedRows = persisted.editedRows.map((row) => [...row]);
          }

          if (persisted.questionLifecycleMap) {
            const restoredLifecycle = deserializeLifecycleMap(persisted.questionLifecycleMap);
            nextLifecycleMap = lifecycleService.initializeForRows(
              selectedWorksheet.rows.map((_, rowIndex) => getRowLifecycleKey(selectedWorksheet.sheetName, rowIndex)),
              restoredLifecycle,
            );
          }

          if (persisted.aiReviewMap) {
            nextReviewMap = persisted.aiReviewMap;
          }

          if (persisted.humanReviewMap) {
            nextHumanReviewMap = deserializeHumanReviewMap(persisted.humanReviewMap);
          }

          if (typeof persisted.processedCount === "number" && persisted.processedCount >= 0) {
            nextProcessedCount = persisted.processedCount;
          }
        }
      } catch {
        // Ignore invalid persisted review state and continue with defaults.
      }
    }

    setEditedRows(nextEditedRows);
    setQuestionLifecycleMap(nextLifecycleMap);
    setAiReviewMap(nextReviewMap);
    setHumanReviewMap(nextHumanReviewMap);
    setReviewProgress((current) => ({
      ...current,
      processed: nextProcessedCount,
      total: selectedWorksheet.rows.length,
      currentRowNumber: 0,
    }));
    setSelectedRowIndex(null);
    setOptionPasteInput("");
    setActiveFilter("all");
    setStatusFilter("all");
  }, [selectedWorksheet, lifecycleService, workbook]);

  React.useEffect(() => {
    if (!selectedRowLifecycle) {
      return;
    }

    setSelectedLifecycleStatus(selectedRowLifecycle.currentStatus);
  }, [selectedRowLifecycle]);

  React.useEffect(() => {
    if (!selectedRowKey) {
      setReviewedByInput("");
      setReviewCommentsInput("");
      return;
    }

    const review = humanReviewMap[selectedRowKey];
    if (review) {
      setReviewedByInput(review.latest.reviewedBy);
      setReviewCommentsInput(review.latest.comments);
      return;
    }

    setReviewedByInput("");
    setReviewCommentsInput("");
  }, [selectedRowKey, humanReviewMap]);

  function isSupportedExcelFile(file: File): boolean {
    const lowerCaseName = file.name.toLowerCase();
    return ACCEPTED_EXTENSIONS.some((extension) =>
      lowerCaseName.endsWith(extension)
    );
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function setFieldMapping(field: ColumnMappingField, value: string): void {
    const nextIndex = value.length === 0 ? null : Number.parseInt(value, 10);

    setMappingSelections((current) => ({
      ...current,
      [field]: {
        columnIndex: Number.isNaN(nextIndex as number) ? null : nextIndex,
        confidence: null,
        source: "manual",
      },
    }));

    setMappingConfirmed(false);
    setSelectedRowIndex(null);
  }

  function applyAutoMapping(): void {
    if (!selectedWorksheet) {
      return;
    }

    setMappingSelections(autoMapHeaders(selectedWorksheet.headers));
    setMappingConfirmed(false);
    setSelectedRowIndex(null);
  }

  function confirmMappingAndValidate(): void {
    if (!selectedWorksheet || !mandatoryMappingComplete) {
      return;
    }

    try {
      const storageKey = buildMappingStorageKey(
        selectedWorksheet.sheetName,
        selectedWorksheet.headers,
      );
      const persisted = toStoredColumnMapping(mappingSelections, selectedWorksheet.headers);
      window.localStorage.setItem(storageKey, JSON.stringify(persisted));
    } catch {
      // Ignore persistence errors and still allow validation.
    }

    setMappingConfirmed(true);
    setSelectedRowIndex(null);
    setActiveFilter("all");
  }

  function updateEditedCell(rowIndex: number, columnIndex: number, value: string): void {
    setEditedRows((currentRows) => currentRows.map((row, index) => {
      if (index !== rowIndex) {
        return row;
      }

      const nextRow = [...row];
      nextRow[columnIndex] = value;
      return nextRow;
    }));
  }

  function getEditedCellValue(rowIndex: number, columnIndex: number | null): string {
    if (columnIndex === null || rowIndex < 0 || rowIndex >= editedRows.length) {
      return "";
    }

    return editedRows[rowIndex]?.[columnIndex] ?? "";
  }

  function setInputRef(
    key: string,
    node: HTMLInputElement | HTMLTextAreaElement | null,
  ): void {
    editorRefs.current[key] = node;
  }

  function focusInputByKey(key: string): void {
    const input = editorRefs.current[key];
    if (input) {
      input.focus();
    }
  }

  function focusMissingField(selected: ValidatedRow): boolean {
    const focusOrder: ReadonlyArray<{ code: string; key: string }> = [
      { code: "EMPTY_QUESTION", key: "questionBody" },
      { code: "MISSING_OPTION_A", key: "optionA" },
      { code: "MISSING_OPTION_B", key: "optionB" },
      { code: "MISSING_OPTION_C", key: "optionC" },
      { code: "MISSING_OPTION_D", key: "optionD" },
    ];

    const found = focusOrder.find((item) => selected.issues.some((issue) => issue.code === item.code));
    if (!found) {
      return false;
    }

    focusInputByKey(found.key);
    return true;
  }

  function goToPreviousIssueRow(): void {
    if (selectedIssueRowPosition <= 0) {
      return;
    }

    setSelectedRowIndex(issueRowIndexes[selectedIssueRowPosition - 1]);
  }

  function goToNextIssueRow(): void {
    if (selectedIssueRowPosition < 0 || selectedIssueRowPosition >= issueRowIndexes.length - 1) {
      return;
    }

    setSelectedRowIndex(issueRowIndexes[selectedIssueRowPosition + 1]);
  }

  function handleSaveRow(): void {
    if (!selectedRow) {
      return;
    }

    const focused = focusMissingField(selectedRow);
    if (!focused) {
      setSelectedRowIndex(null);
    }
  }

  function handlePasteMultipleOptions(rowIndex: number): void {
    const values = optionPasteInput
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (values.length === 0) {
      return;
    }

    const optionFields: ReadonlyArray<"optionA" | "optionB" | "optionC" | "optionD"> = [
      "optionA",
      "optionB",
      "optionC",
      "optionD",
    ];

    optionFields.forEach((field, index) => {
      const columnIndex = mappingSelections[field].columnIndex;
      if (columnIndex !== null) {
        updateEditedCell(rowIndex, columnIndex, values[index] ?? "");
      }
    });

    setOptionPasteInput("");
  }

  function buildOriginalSnapshot(rowIndex: number): ReviewFieldSnapshot[] {
    if (!selectedWorksheet || rowIndex < 0 || rowIndex >= selectedWorksheet.rows.length) {
      return [];
    }

    const sourceRow = selectedWorksheet.rows[rowIndex];

    const resolve = (columnIndex: number | null): string => {
      if (columnIndex === null) {
        return "";
      }

      return sourceRow[columnIndex] ?? "";
    };

    return [
      { key: "questionBody", label: MAPPING_FIELD_LABELS.questionBody, value: resolve(mappingSelections.questionBody.columnIndex) },
      { key: "optionA", label: MAPPING_FIELD_LABELS.optionA, value: resolve(mappingSelections.optionA.columnIndex) },
      { key: "optionB", label: MAPPING_FIELD_LABELS.optionB, value: resolve(mappingSelections.optionB.columnIndex) },
      { key: "optionC", label: MAPPING_FIELD_LABELS.optionC, value: resolve(mappingSelections.optionC.columnIndex) },
      { key: "optionD", label: MAPPING_FIELD_LABELS.optionD, value: resolve(mappingSelections.optionD.columnIndex) },
      { key: "correctAnswer", label: AI_GENERATED_FIELD_LABELS.correctAnswer, value: resolve(aiFieldColumnIndexes.correctAnswer) },
      { key: "explanation", label: AI_GENERATED_FIELD_LABELS.printedBookReferenceOrExplanation, value: resolve(aiFieldColumnIndexes.printedBookReferenceOrExplanation) },
    ];
  }

  function buildAiGeneratedSnapshot(): ReviewFieldSnapshot[] {
    if (!selectedRowKey) {
      return [];
    }

    const review = aiReviewMap[selectedRowKey];
    if (!review) {
      return [];
    }

    return [
      { key: "topic", label: MAPPING_FIELD_LABELS.topic, value: review.result.topic },
      { key: "difficulty", label: MAPPING_FIELD_LABELS.difficulty, value: review.result.difficulty },
      { key: "correctAnswer", label: AI_GENERATED_FIELD_LABELS.correctAnswer, value: review.result.correctAnswer },
      {
        key: "correctAnswerPosition",
        label: AI_GENERATED_FIELD_LABELS.correctAnswerPosition,
        value: String(review.result.correctAnswerPosition),
      },
      { key: "optionRelevance", label: AI_GENERATED_FIELD_LABELS.optionRelevance, value: review.result.bloomTaxonomy },
      {
        key: "explanation",
        label: AI_GENERATED_FIELD_LABELS.printedBookReferenceOrExplanation,
        value: review.result.explanation,
      },
      { key: "remarks", label: AI_GENERATED_FIELD_LABELS.reviewerRemarks, value: review.result.reviewerRemarks },
    ];
  }

  function buildReviewerEditSnapshot(rowIndex: number): ReviewFieldSnapshot[] {
    return [
      { key: "questionBody", label: MAPPING_FIELD_LABELS.questionBody, value: getEditedCellValue(rowIndex, mappingSelections.questionBody.columnIndex) },
      { key: "optionA", label: MAPPING_FIELD_LABELS.optionA, value: getEditedCellValue(rowIndex, mappingSelections.optionA.columnIndex) },
      { key: "optionB", label: MAPPING_FIELD_LABELS.optionB, value: getEditedCellValue(rowIndex, mappingSelections.optionB.columnIndex) },
      { key: "optionC", label: MAPPING_FIELD_LABELS.optionC, value: getEditedCellValue(rowIndex, mappingSelections.optionC.columnIndex) },
      { key: "optionD", label: MAPPING_FIELD_LABELS.optionD, value: getEditedCellValue(rowIndex, mappingSelections.optionD.columnIndex) },
      { key: "topic", label: MAPPING_FIELD_LABELS.topic, value: getEditedCellValue(rowIndex, mappingSelections.topic.columnIndex) },
      { key: "difficulty", label: MAPPING_FIELD_LABELS.difficulty, value: getEditedCellValue(rowIndex, mappingSelections.difficulty.columnIndex) },
      { key: "correctAnswer", label: AI_GENERATED_FIELD_LABELS.correctAnswer, value: getEditedCellValue(rowIndex, aiFieldColumnIndexes.correctAnswer) },
      {
        key: "explanation",
        label: AI_GENERATED_FIELD_LABELS.printedBookReferenceOrExplanation,
        value: getEditedCellValue(rowIndex, aiFieldColumnIndexes.printedBookReferenceOrExplanation),
      },
    ];
  }

  function handleSubmitHumanReview(action: HumanReviewAction): void {
    if (!selectedRow || !selectedWorksheet || !selectedRowKey) {
      return;
    }

    if (reviewedByInput.trim().length === 0) {
      setValidationMessage("Enter Reviewed By before submitting human review.");
      return;
    }

    const nextHumanReviewMap = humanReviewService.submitReview(humanReviewMap, {
      rowKey: selectedRowKey,
      action,
      reviewedBy: reviewedByInput,
      comments: reviewCommentsInput,
    });

    setHumanReviewMap(nextHumanReviewMap);

    const nextStatus = humanReviewService.resolveStatus(action);
    const nextLifecycleMap = lifecycleService.transitionStatus(
      questionLifecycleMap,
      selectedRowKey,
      nextStatus,
    );

    setQuestionLifecycleMap(nextLifecycleMap);
    setSelectedLifecycleStatus(nextStatus);
    setValidationMessage(null);

    persistReviewProgress(
      nextLifecycleMap,
      aiReviewMap,
      nextHumanReviewMap,
      editedRows,
      reviewProgress.processed,
    );
  }

  function applyLifecycleStatusForSelectedRow(): void {
    if (!selectedRow) {
      return;
    }

    const rowKey = getRowLifecycleKey(selectedRow.sheetName, selectedRow.rowIndex);
    setQuestionLifecycleMap((current) => lifecycleService.transitionStatus(
      current,
      rowKey,
      selectedLifecycleStatus,
    ));
  }

  function getReviewStorageKeyForCurrentWorksheet(): string | null {
    if (!workbook || !selectedWorksheet) {
      return null;
    }

    return buildReviewProgressStorageKey(
      workbook.workbookName,
      selectedWorksheet.sheetName,
      selectedWorksheet.headers,
    );
  }

  function persistReviewProgress(
    lifecycleMap: QuestionLifecycleMap,
    reviewMap: AIReviewMap,
    humanReviews: HumanReviewMap,
    rows: readonly (readonly string[])[],
    processedCount: number,
  ): void {
    const storageKey = getReviewStorageKeyForCurrentWorksheet();
    if (!storageKey) {
      return;
    }

    const payload: PersistedReviewProgress = {
      editedRows: rows,
      questionLifecycleMap: serializeLifecycleMap(lifecycleMap),
      aiReviewMap: reviewMap,
      humanReviewMap: serializeHumanReviewMap(humanReviews),
      processedCount,
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // Ignore storage errors; keep in-memory progress.
    }
  }

  function applyAIReviewResultToRow(
    rows: readonly (readonly string[])[],
    rowIndex: number,
    result: QuestionReviewResult,
  ): readonly (readonly string[])[] {
    const nextRows = rows.map((row) => [...row]);

    const setValue = (columnIndex: number | null, value: string): void => {
      if (columnIndex === null) {
        return;
      }

      const row = [...(nextRows[rowIndex] ?? [])];
      row[columnIndex] = value;
      nextRows[rowIndex] = row;
    };

    setValue(mappingSelections.topic.columnIndex, result.topic);
    setValue(mappingSelections.difficulty.columnIndex, result.difficulty);
    setValue(aiFieldColumnIndexes.correctAnswer, result.correctAnswer);
    setValue(aiFieldColumnIndexes.correctAnswerPosition, String(result.correctAnswerPosition));
    setValue(aiFieldColumnIndexes.optionRelevance, `${result.bloomTaxonomy}`);
    setValue(aiFieldColumnIndexes.printedBookReferenceOrExplanation, result.explanation);
    setValue(aiFieldColumnIndexes.reviewerRemarks, result.reviewerRemarks);

    return nextRows;
  }

  async function handleReviewWorkbook(): Promise<void> {
    if (!selectedWorksheet || !validationResult || isReviewRunning) {
      return;
    }

    const rows = validationResult.worksheets[0].rows;
    if (rows.length === 0) {
      return;
    }

    reviewCancelRequestedRef.current = false;
    setIsReviewRunning(true);

    let workingLifecycleMap = { ...questionLifecycleMap };
    let workingReviewMap = { ...aiReviewMap };
    let workingRows: readonly (readonly string[])[] = editedRows.map((row) => [...row]);
    let processedCount = 0;

    const rowsToProcess = rows.filter((row) => {
      const rowKey = getRowLifecycleKey(row.sheetName, row.rowIndex);
      return workingLifecycleMap[rowKey]?.currentStatus !== QuestionStatus.AIReviewed;
    });

    setReviewProgress({
      processed: 0,
      total: rowsToProcess.length,
      currentRowNumber: 0,
    });

    try {
      for (let index = 0; index < rowsToProcess.length; index += 1) {
        if (reviewCancelRequestedRef.current) {
          break;
        }

        const row = rowsToProcess[index];
        const rowKey = getRowLifecycleKey(row.sheetName, row.rowIndex);

        workingLifecycleMap = lifecycleService.transitionStatus(
          workingLifecycleMap,
          rowKey,
          QuestionStatus.PendingAIReview,
        );
        setQuestionLifecycleMap(workingLifecycleMap);

        setReviewProgress({
          processed: processedCount,
          total: rowsToProcess.length,
          currentRowNumber: row.rowNumber,
        });

        const questionBody = getEditedCellValue(row.rowIndex, mappingSelections.questionBody.columnIndex);
        const optionA = getEditedCellValue(row.rowIndex, mappingSelections.optionA.columnIndex);
        const optionB = getEditedCellValue(row.rowIndex, mappingSelections.optionB.columnIndex);
        const optionC = getEditedCellValue(row.rowIndex, mappingSelections.optionC.columnIndex);
        const optionD = getEditedCellValue(row.rowIndex, mappingSelections.optionD.columnIndex);
        const topic = getEditedCellValue(row.rowIndex, mappingSelections.topic.columnIndex);
        const difficulty = getEditedCellValue(row.rowIndex, mappingSelections.difficulty.columnIndex);
        const marks = getEditedCellValue(row.rowIndex, mappingSelections.marks.columnIndex);

        const reviewResult = await questionReviewEngine.reviewQuestion({
          questionBody,
          optionA,
          optionB,
          optionC,
          optionD,
          topic,
          difficulty,
          marks,
        });

        workingRows = applyAIReviewResultToRow(workingRows, row.rowIndex, reviewResult);
        setEditedRows(workingRows);

        workingReviewMap = {
          ...workingReviewMap,
          [rowKey]: {
            generatedAt: new Date().toISOString(),
            result: reviewResult,
          },
        };
        setAiReviewMap(workingReviewMap);

        workingLifecycleMap = lifecycleService.transitionStatus(
          workingLifecycleMap,
          rowKey,
          QuestionStatus.AIReviewed,
        );
        setQuestionLifecycleMap(workingLifecycleMap);

        processedCount += 1;
        setReviewProgress({
          processed: processedCount,
          total: rowsToProcess.length,
          currentRowNumber: row.rowNumber,
        });

        persistReviewProgress(
          workingLifecycleMap,
          workingReviewMap,
          humanReviewMap,
          workingRows,
          processedCount,
        );
      }
    } catch (error) {
      console.error("AI review failed.", error);
      setValidationMessage(
        "AI review stopped because one row failed to process. You can fix the row and run Review Workbook again.",
      );
    } finally {
      setIsReviewRunning(false);
      reviewCancelRequestedRef.current = false;
    }
  }

  function handleCancelReview(): void {
    reviewCancelRequestedRef.current = true;
  }

  async function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    setValidationMessage(null);
    setWorkbook(null);
    setSelectedRowIndex(null);
    setMappingSelections(createEmptyMappingSelections());
    setMappingConfirmed(false);
    setEditedRows([]);
    setQuestionLifecycleMap({});
    setAiReviewMap({});
    setHumanReviewMap({});
    setReviewProgress({
      processed: 0,
      total: 0,
      currentRowNumber: 0,
    });
    setStatusFilter("all");
    setOptionPasteInput("");

    if (!isSupportedExcelFile(file)) {
      setValidationMessage("Please select a valid Excel file (.xlsx).");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationMessage("File size must be 20 MB or less.");
      event.target.value = "";
      return;
    }

    setIsProcessing(true);

    try {
      const parsedWorkbook = await excelImportService.importWorkbook(file);

      startTransition(() => {
        setWorkbook(parsedWorkbook);
      });
    } catch (error) {
      console.error("Failed to parse Excel workbook", error);
      setValidationMessage(
        "We could not read this workbook. Please confirm that the file is a valid .xlsx file and try again.",
      );
      event.target.value = "";
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Upload Excel Workbook
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Import Workflow</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ol className="list-decimal space-y-1 pl-5">
              <li>Upload workbook</li>
              <li>Column mapping</li>
              <li>Pre-AI validation (input fields only)</li>
              <li>AI review and enrichment</li>
              <li>Human review</li>
              <li>Save/Export</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Excel File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleFileSelection}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="button" variant="outline" onClick={openFilePicker}>
                Choose File
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedFileName || "No file selected"}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Supported format: .xlsx (max 20 MB)
            </p>

            {validationMessage ? (
              <p className="text-sm text-destructive">{validationMessage}</p>
            ) : null}

            {isBusy ? (
              <p className="text-sm text-muted-foreground">
                Parsing workbook. Large files may take a few moments.
              </p>
            ) : null}

            <div className="pt-2">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReviewWorkbook}
                  disabled={
                    !validationResult
                    || validationResult.hasErrors
                    || isBusy
                    || isReviewRunning
                  }
                >
                  Review Workbook
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelReview}
                  disabled={!isReviewRunning}
                >
                  Cancel Review
                </Button>

                <span className="text-xs text-muted-foreground">
                  {isReviewRunning
                    ? `Reviewing row ${reviewProgress.currentRowNumber || "-"} (${reviewProgress.processed}/${reviewProgress.total})`
                    : reviewProgress.total > 0
                      ? `Last review progress: ${reviewProgress.processed}/${reviewProgress.total}`
                      : "No AI review progress yet."}
                </span>
              </div>

              <Button
                type="button"
                disabled={
                  validationResult === null
                  || validationResult.hasErrors
                  || isBusy
                }
              >
                Import Questions
              </Button>
              {validationResult?.hasErrors ? (
                <p className="mt-2 text-xs text-destructive">
                  Import is disabled because one or more rows contain errors.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {selectedWorksheet ? (
          <Card>
            <CardHeader>
              <CardTitle>Column Mapping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Worksheet</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={selectedWorksheetName}
                    onChange={(event) => {
                      setSelectedWorksheetName(event.target.value);
                      setMappingConfirmed(false);
                      setSelectedRowIndex(null);
                    }}
                  >
                    {workbook?.worksheets.map((worksheet) => (
                      <option key={worksheet.sheetName} value={worksheet.sheetName}>
                        {worksheet.sheetName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="outline" onClick={applyAutoMapping}>
                    Re-run Auto Mapping
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <p className="mb-3 text-sm font-medium text-foreground">AI-generated fields</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {AI_GENERATED_FIELDS.map((field) => (
                    <div key={field} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <span>{AI_GENERATED_FIELD_LABELS[field]}</span>
                      <Badge variant="secondary">Will be generated by AI during Review.</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {ALL_MAPPING_FIELDS.map((field) => {
                  const mapping = mappingSelections[field];
                  const isRequired = REQUIRED_MAPPING_FIELDS.includes(field);

                  return (
                    <div key={field} className="grid gap-2 lg:grid-cols-[220px_1fr_auto] lg:items-center">
                      <label className="text-sm font-medium">
                        {MAPPING_FIELD_LABELS[field]}
                        {isRequired ? <span className="ml-1 text-destructive">*</span> : null}
                      </label>

                      <select
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={mapping.columnIndex === null ? "" : String(mapping.columnIndex)}
                        onChange={(event) => setFieldMapping(field, event.target.value)}
                      >
                        <option value="">Not mapped</option>
                        {selectedWorksheet.headers.map((header, index) => (
                          <option key={`${field}-header-${index}`} value={String(index)}>
                            {header || `(empty header ${index + 1})`}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2">
                        {mapping.confidence !== null ? (
                          <Badge variant="secondary">
                            Confidence {confidenceToPercentage(mapping.confidence)}
                          </Badge>
                        ) : null}
                        <Badge variant="outline">{mapping.source}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!mandatoryMappingComplete ? (
                <p className="text-sm text-destructive">
                  Map all mandatory fields before validation can run.
                </p>
              ) : null}

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={confirmMappingAndValidate}
                  disabled={!mandatoryMappingComplete}
                >
                  Confirm Mapping and Validate
                </Button>
                {mappingConfirmed ? (
                  <Badge>Mapping confirmed</Badge>
                ) : (
                  <Badge variant="secondary">Validation pending mapping confirmation</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {validationResult ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workbook Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">File:</span>{" "}
                  {validationResult.workbook.workbookName}
                </p>
                <p>
                  <span className="font-medium text-foreground">Worksheet:</span>{" "}
                  {selectedWorksheetName}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-6">
                  <div className="rounded-md border p-3">
                    <p className="text-muted-foreground">Total Rows</p>
                    <p className="text-xl font-semibold">{validationResult.summary.totalRows}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-muted-foreground">Required Input Fields</p>
                    <p className="text-xl font-semibold">{validationResult.summary.requiredInputFields}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-muted-foreground">AI Fields To Generate</p>
                    <p className="text-xl font-semibold">{validationResult.summary.aiFieldsToGenerate}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-muted-foreground">Valid Rows</p>
                    <p className="text-xl font-semibold text-green-700 dark:text-green-400">
                      {validationResult.summary.validRows}
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <button
                      type="button"
                      className="text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
                      onClick={() => setActiveFilter("errors")}
                    >
                      Validation Errors
                    </button>
                    <p className="text-xl font-semibold text-destructive">
                      {validationResult.summary.validationErrors}
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-muted-foreground">Warnings</p>
                    <p className="text-xl font-semibold text-amber-700 dark:text-amber-400">
                      {validationResult.summary.warnings}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs
              value={activeFilter}
              onValueChange={(value) => setActiveFilter(value as RowFilter)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="valid">Valid</TabsTrigger>
                <TabsTrigger value="warnings">Warnings</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
                <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Filter by lifecycle status</label>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value="all">All Statuses</option>
                {allLifecycleStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {validationResult.worksheets.map((worksheet) => {
              const visibleRows = worksheet.rows.filter((row) => {
                const matchesValidation = matchesFilter(row, activeFilter);
                if (!matchesValidation) {
                  return false;
                }

                if (statusFilter === "all") {
                  return true;
                }

                const rowKey = getRowLifecycleKey(row.sheetName, row.rowIndex);
                const rowLifecycle = questionLifecycleMap[rowKey];
                return rowLifecycle?.currentStatus === statusFilter;
              });

              return (
                <Card key={worksheet.sheetName}>
                  <CardHeader>
                    <CardTitle>{worksheet.sheetName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                      <p>
                        <span className="font-medium text-foreground">Sheet:</span>{" "}
                        {worksheet.sheetName}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Rows:</span>{" "}
                        {worksheet.rows.length}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Columns:</span>{" "}
                        {worksheet.headers.length}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Visible Rows:</span>{" "}
                        {visibleRows.length}
                      </p>
                    </div>

                    <div className="max-h-[420px] overflow-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Lifecycle</TableHead>
                            <TableHead>Row</TableHead>
                            {worksheet.headers.map((header, columnIndex) => (
                              <TableHead key={`${worksheet.sheetName}-header-${columnIndex}`}>
                                {header || "(empty)"}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visibleRows.map((row) => (
                            <TableRow
                              key={`${worksheet.sheetName}-row-${row.rowIndex}`}
                              className={getRowClassName(row.status)}
                              onClick={() => setSelectedRowIndex(row.rowIndex)}
                            >
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(row.status)}>
                                  {getStatusLabel(row.status)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={getLifecycleBadgeClassName(
                                    questionLifecycleMap[
                                      getRowLifecycleKey(row.sheetName, row.rowIndex)
                                    ]?.currentStatus ?? QuestionStatus.Imported,
                                  )}
                                >
                                  {
                                    questionLifecycleMap[
                                      getRowLifecycleKey(row.sheetName, row.rowIndex)
                                    ]?.currentStatus ?? QuestionStatus.Imported
                                  }
                                </Badge>
                              </TableCell>
                              <TableCell>{row.rowNumber}</TableCell>
                              {row.cells.map((cellValue, columnIndex) => (
                                <TableCell
                                  key={`${worksheet.sheetName}-row-${row.rowIndex}-cell-${columnIndex}`}
                                  className="align-top"
                                >
                                  {cellValue || ""}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Sheet
              open={selectedRowIndex !== null}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedRowIndex(null);
                }
              }}
            >
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>
                    Row Editor
                  </SheetTitle>
                  <SheetDescription>
                    {selectedRow
                      ? `${selectedRow.sheetName} - Row ${selectedRow.rowNumber}`
                      : ""}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 overflow-auto px-4 pb-4">
                  {selectedRow ? (
                    <>
                      <div className="space-y-3 rounded-md border p-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Question Body
                          </label>
                          <textarea
                            ref={(node) => setInputRef("questionBody", node)}
                            className="min-h-[92px] w-full rounded-md border border-input bg-background p-2 text-sm"
                            value={getEditedCellValue(selectedRow.rowIndex, mappingSelections.questionBody.columnIndex)}
                            onChange={(event) => {
                              const columnIndex = mappingSelections.questionBody.columnIndex;
                              if (columnIndex !== null) {
                                updateEditedCell(selectedRow.rowIndex, columnIndex, event.target.value);
                              }
                            }}
                          />
                        </div>

                        {(["optionA", "optionB", "optionC", "optionD"] as const).map((field) => {
                          const columnIndex = mappingSelections[field].columnIndex;

                          return (
                            <div key={field}>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                {MAPPING_FIELD_LABELS[field]}
                              </label>
                              <input
                                ref={(node) => setInputRef(field, node)}
                                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                                value={getEditedCellValue(selectedRow.rowIndex, columnIndex)}
                                onChange={(event) => {
                                  if (columnIndex !== null) {
                                    updateEditedCell(selectedRow.rowIndex, columnIndex, event.target.value);
                                  }
                                }}
                              />
                            </div>
                          );
                        })}

                        <div className="space-y-2 rounded-md border border-dashed p-3">
                          <label className="block text-xs font-medium text-muted-foreground">
                            Paste Multiple Values for Options A-D (one value per line)
                          </label>
                          <textarea
                            className="min-h-[92px] w-full rounded-md border border-input bg-background p-2 text-sm"
                            value={optionPasteInput}
                            onChange={(event) => setOptionPasteInput(event.target.value)}
                            placeholder={"Option A\nOption B\nOption C\nOption D"}
                          />
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handlePasteMultipleOptions(selectedRow.rowIndex)}
                              disabled={optionPasteInput.trim().length === 0}
                            >
                              Apply Pasted Values
                            </Button>
                          </div>
                        </div>

                        {(["topic", "difficulty", "marks"] as const).map((field) => {
                          const columnIndex = mappingSelections[field].columnIndex;

                          return (
                            <div key={field}>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                {MAPPING_FIELD_LABELS[field]}
                              </label>
                              <input
                                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                                value={getEditedCellValue(selectedRow.rowIndex, columnIndex)}
                                onChange={(event) => {
                                  if (columnIndex !== null) {
                                    updateEditedCell(selectedRow.rowIndex, columnIndex, event.target.value);
                                  }
                                }}
                                disabled={columnIndex === null}
                              />
                            </div>
                          );
                        })}

                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Correct Answer
                          </label>
                          <input
                            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                            value={getEditedCellValue(selectedRow.rowIndex, aiFieldColumnIndexes.correctAnswer)}
                            onChange={(event) => {
                              if (aiFieldColumnIndexes.correctAnswer !== null) {
                                updateEditedCell(
                                  selectedRow.rowIndex,
                                  aiFieldColumnIndexes.correctAnswer,
                                  event.target.value,
                                );
                              }
                            }}
                            disabled={aiFieldColumnIndexes.correctAnswer === null}
                          />
                        </div>

                        {(Object.keys(aiFieldColumnIndexes) as Array<keyof typeof aiFieldColumnIndexes>)
                          .filter((field) => field !== "correctAnswer" && aiFieldColumnIndexes[field] !== null)
                          .map((field) => (
                            <div key={field}>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                {AI_GENERATED_FIELD_LABELS[field]}
                              </label>
                              <textarea
                                className="min-h-[72px] w-full rounded-md border border-input bg-background p-2 text-sm"
                                value={getEditedCellValue(selectedRow.rowIndex, aiFieldColumnIndexes[field])}
                                onChange={(event) => {
                                  const columnIndex = aiFieldColumnIndexes[field];
                                  if (columnIndex !== null) {
                                    updateEditedCell(selectedRow.rowIndex, columnIndex, event.target.value);
                                  }
                                }}
                              />
                            </div>
                          ))}
                      </div>

                      <div className="space-y-3 rounded-md border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">Human Review</p>
                          {selectedRowHumanReview ? (
                            <Badge variant="outline">
                              Last Decision: {selectedRowHumanReview.latest.action}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending Decision</Badge>
                          )}
                        </div>

                        <div className="grid gap-3 xl:grid-cols-3">
                          <div className="space-y-2 rounded-md border p-2">
                            <p className="text-xs font-medium text-muted-foreground">Original</p>
                            <div className="max-h-52 space-y-2 overflow-auto pr-1">
                              {buildOriginalSnapshot(selectedRow.rowIndex).map((item) => (
                                <div key={`original-${item.key}`} className="rounded-sm border p-2">
                                  <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
                                  <p className="whitespace-pre-wrap text-xs">{item.value || "-"}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 rounded-md border p-2">
                            <p className="text-xs font-medium text-muted-foreground">AI Generated</p>
                            <div className="max-h-52 space-y-2 overflow-auto pr-1">
                              {buildAiGeneratedSnapshot().length > 0 ? (
                                buildAiGeneratedSnapshot().map((item) => (
                                  <div key={`ai-${item.key}`} className="rounded-sm border p-2">
                                    <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
                                    <p className="whitespace-pre-wrap text-xs">{item.value || "-"}</p>
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-sm border p-2 text-xs text-muted-foreground">
                                  AI review not available for this row yet.
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 rounded-md border p-2">
                            <p className="text-xs font-medium text-muted-foreground">Reviewer Edit</p>
                            <div className="max-h-52 space-y-2 overflow-auto pr-1">
                              {buildReviewerEditSnapshot(selectedRow.rowIndex).map((item) => (
                                <div key={`reviewer-${item.key}`} className="rounded-sm border p-2">
                                  <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
                                  <p className="whitespace-pre-wrap text-xs">{item.value || "-"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                              Reviewed By
                            </label>
                            <input
                              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                              value={reviewedByInput}
                              onChange={(event) => setReviewedByInput(event.target.value)}
                              placeholder="Reviewer name"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                              Comments
                            </label>
                            <input
                              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                              value={reviewCommentsInput}
                              onChange={(event) => setReviewCommentsInput(event.target.value)}
                              placeholder="Decision notes"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="default"
                            onClick={() => handleSubmitHumanReview(HumanReviewAction.Accept)}
                          >
                            Accept
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleSubmitHumanReview(HumanReviewAction.Reject)}
                          >
                            Reject
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleSubmitHumanReview(HumanReviewAction.Modify)}
                          >
                            Modify
                          </Button>
                        </div>

                        {selectedRowHumanReview ? (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Human Review History</p>
                            <div className="max-h-32 space-y-1 overflow-auto rounded-md border p-2">
                              {selectedRowHumanReview.history.map((entry, index) => (
                                <div
                                  key={`${entry.action}-${entry.reviewedOn.toISOString()}-${index}`}
                                  className="text-xs text-muted-foreground"
                                >
                                  <span className="font-medium text-foreground">{entry.action}</span>
                                  {" by "}
                                  <span className="font-medium text-foreground">{entry.reviewedBy}</span>
                                  {" on "}
                                  {entry.reviewedOn.toLocaleString()}
                                  {entry.comments.length > 0 ? ` - ${entry.comments}` : ""}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-3 rounded-md border p-3">
                        <p className="text-sm font-medium">Question Lifecycle</p>
                        <div className="grid gap-2 lg:grid-cols-[1fr_auto] lg:items-center">
                          <select
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={selectedLifecycleStatus}
                            onChange={(event) => {
                              setSelectedLifecycleStatus(event.target.value as QuestionStatus);
                            }}
                          >
                            {allLifecycleStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <Button type="button" variant="outline" onClick={applyLifecycleStatusForSelectedRow}>
                            Update Status
                          </Button>
                        </div>

                        {selectedRowLifecycle ? (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Status Timeline</p>
                            <div className="max-h-32 space-y-1 overflow-auto rounded-md border p-2">
                              {selectedRowLifecycle.history.map((entry, index) => (
                                <div key={`${entry.status}-${entry.changedAt.toISOString()}-${index}`} className="text-xs text-muted-foreground">
                                  <span className="font-medium text-foreground">{entry.status}</span>
                                  {" - "}
                                  {entry.changedAt.toLocaleString()}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Validation Issues</p>
                        {selectedRow.issues.length > 0 ? (
                          selectedRow.issues.map((issue: RowValidationIssue, index) => (
                            <div key={`${issue.code}-${index}`} className="rounded-md border p-3">
                              <div className="mb-2 flex items-center gap-2">
                                <Badge variant={issue.severity === "error" ? "destructive" : "secondary"}>
                                  {issue.severity === "error" ? "Error" : "Warning"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{issue.code}</span>
                              </div>
                              <p className="text-sm">{issue.message}</p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-md border p-3 text-sm text-green-700 dark:text-green-400">
                            All row issues resolved.
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md border p-3 text-sm text-muted-foreground">
                      Select a row to edit.
                    </div>
                  )}
                </div>

                <SheetFooter>
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goToPreviousIssueRow}
                        disabled={selectedIssueRowPosition <= 0}
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goToNextIssueRow}
                        disabled={
                          selectedIssueRowPosition < 0
                          || selectedIssueRowPosition >= issueRowIndexes.length - 1
                        }
                      >
                        Next
                      </Button>
                    </div>

                    <Button type="button" onClick={handleSaveRow}>
                      Save
                    </Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        ) : null}
      </div>
    </AuthenticatedLayout>
  );
}
