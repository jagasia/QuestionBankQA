import { type CanonicalQuestion } from "./CanonicalQuestion";
import { type ImportedWorkbook } from "./ImportedWorkbook";
import { type TemplateProfile } from "./TemplateProfile";

/**
 * Aggregate import outcome consumed by later workflow stages.
 */
export interface ImportResult {
  /** Workbook content as imported from Excel. */
  workbook: ImportedWorkbook;

  /** Template mapping profile associated with this import. */
  templateProfile: TemplateProfile;

  /** Canonical questions derived from the imported workbook. */
  canonicalQuestions: CanonicalQuestion[];

  /** Non-blocking import warnings for downstream handling. */
  warnings: string[];

  /** Blocking import errors for downstream handling. */
  errors: string[];
}
