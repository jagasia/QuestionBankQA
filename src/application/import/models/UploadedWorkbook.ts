/**
 * Opaque workbook input provided to application-layer parser contracts.
 *
 * The application layer treats the workbook source as an abstract payload so
 * infrastructure-specific parsers can adapt it without coupling to any
 * particular framework or file library.
 */
export interface UploadedWorkbook {
  /** Human-readable workbook name supplied by the caller or upload context. */
  readonly workbookName: string;

  /** Opaque workbook payload consumed by infrastructure-specific parsers. */
  readonly content: unknown;
}
