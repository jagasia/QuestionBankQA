import { ImportJob } from "../../domain/imports/ImportJob";
import { ImportStatus } from "../../domain/imports/ImportStatus";
import { ColumnMapping } from "../../domain/templates/ColumnMapping";
import { TemplateDetectionService } from "../../domain/templates/TemplateDetectionService";
import { TemplateFingerprintService } from "../../domain/templates/TemplateFingerprintService";
import { TemplateMatchType } from "../../domain/templates/TemplateMatchType";
import { TemplateProfile } from "../../domain/templates/TemplateProfile";
import { ImportJobRepository } from "../ports/ImportJobRepository";
import { TemplateProfileRepository } from "../ports/TemplateProfileRepository";
import { ImportWorkflowResult } from "./ImportWorkflowResult";

type ImportedWorkbook = readonly ColumnMapping[];

/**
 * Application service that orchestrates the import workflow for a parsed workbook.
 */
export class ImportWorkflowService {
  /**
   * Creates a new workflow service with injected domain services and ports.
   */
  constructor(
    private readonly templateFingerprintService: TemplateFingerprintService,
    private readonly templateDetectionService: TemplateDetectionService,
    private readonly importJobRepository: ImportJobRepository,
    private readonly templateProfileRepository: TemplateProfileRepository,
  ) {
    this.validateDependencies(
      templateFingerprintService,
      templateDetectionService,
      importJobRepository,
      templateProfileRepository,
    );
  }

  /**
   * Starts the import workflow for a parsed workbook and returns the workflow result.
   */
  public async startImport(
    importJobId: string,
    requestedBy: string,
    createdAt: Date,
    importedWorkbook: ImportedWorkbook,
  ): Promise<ImportWorkflowResult> {
    this.validate(importJobId, requestedBy, createdAt, importedWorkbook);

    let importJob = this.createImportJob(importJobId, requestedBy, createdAt);
    const fingerprint = this.templateFingerprintService.generateFingerprint(importedWorkbook);
    const templateProfiles = await this.loadTemplateProfiles();
    const detectionResult = this.templateDetectionService.detect(
      fingerprint,
      templateProfiles,
    );

    importJob = this.applyTemplateDetection(importJob, detectionResult);
    await this.importJobRepository.save(importJob);

    return this.createWorkflowResult(
      importJob,
      detectionResult,
      fingerprint,
      new Date(),
    );
  }

  /**
   * Validates constructor dependencies used by workflow orchestration.
   */
  private validateDependencies(
    templateFingerprintService: TemplateFingerprintService,
    templateDetectionService: TemplateDetectionService,
    importJobRepository: ImportJobRepository,
    templateProfileRepository: TemplateProfileRepository,
  ): void {
    if (templateFingerprintService === null || templateFingerprintService === undefined) {
      throw new Error(
        "Invalid ImportWorkflowService: templateFingerprintService cannot be null or undefined.",
      );
    }

    if (templateDetectionService === null || templateDetectionService === undefined) {
      throw new Error(
        "Invalid ImportWorkflowService: templateDetectionService cannot be null or undefined.",
      );
    }

    if (importJobRepository === null || importJobRepository === undefined) {
      throw new Error(
        "Invalid ImportWorkflowService: importJobRepository cannot be null or undefined.",
      );
    }

    if (templateProfileRepository === null || templateProfileRepository === undefined) {
      throw new Error(
        "Invalid ImportWorkflowService: templateProfileRepository cannot be null or undefined.",
      );
    }
  }

  /**
   * Validates orchestration inputs before domain coordination starts.
   */
  private validate(
    importJobId: string,
    requestedBy: string,
    createdAt: Date,
    importedWorkbook: ImportedWorkbook,
  ): void {
    this.validateNonEmptyString(importJobId, "importJobId");
    this.validateNonEmptyString(requestedBy, "requestedBy");

    if (!(createdAt instanceof Date) || Number.isNaN(createdAt.getTime())) {
      throw new Error(
        "Invalid ImportWorkflowService input: createdAt must be a valid Date.",
      );
    }

    if (importedWorkbook === null || importedWorkbook === undefined) {
      throw new Error(
        "Invalid ImportWorkflowService input: importedWorkbook cannot be null or undefined.",
      );
    }
  }

  /**
   * Creates a new import aggregate at the Created lifecycle state.
   */
  private createImportJob(
    importJobId: string,
    requestedBy: string,
    createdAt: Date,
  ): ImportJob {
    return new ImportJob({
      id: importJobId,
      createdBy: requestedBy,
      createdAt,
      status: ImportStatus.Created,
      templateProfileVersion: undefined,
      statistics: undefined,
      warnings: [],
      errors: [],
      startedAt: undefined,
      completedAt: undefined,
    });
  }

  /**
   * Loads all template profiles needed for exact fingerprint detection.
   */
  private loadTemplateProfiles(): Promise<readonly TemplateProfile[]> {
    return this.templateProfileRepository.findAll();
  }

  /**
   * Applies the template detection result using aggregate transitions only.
   */
  private applyTemplateDetection(
    importJob: ImportJob,
    detectionResult: ReturnType<TemplateDetectionService["detect"]>,
  ): ImportJob {
    switch (detectionResult.getMatchType()) {
      case TemplateMatchType.EXACT:
        return importJob
          .detectTemplate(detectionResult.getTemplateProfileVersion())
          .awaitUserApproval();
      case TemplateMatchType.NONE:
        return importJob;
      default:
        throw new Error(
          `Unsupported TemplateMatchType in ImportWorkflowService: '${detectionResult.getMatchType()}'.`,
        );
    }
  }

  /**
   * Creates the immutable workflow result returned to callers.
   */
  private createWorkflowResult(
    importJob: ImportJob,
    templateDetectionResult: ReturnType<TemplateDetectionService["detect"]>,
    fingerprint: string,
    processingTimestamp: Date,
  ): ImportWorkflowResult {
    return new ImportWorkflowResult({
      importJob,
      templateDetectionResult,
      fingerprint,
      processingTimestamp,
    });
  }

  /**
   * Validates that a required string input is present and non-empty.
   */
  private validateNonEmptyString(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(
        `Invalid ImportWorkflowService input: ${fieldName} cannot be null or undefined.`,
      );
    }

    if (typeof value !== "string") {
      throw new Error(
        `Invalid ImportWorkflowService input: ${fieldName} must be a string.`,
      );
    }

    if (value.trim().length === 0) {
      throw new Error(
        `Invalid ImportWorkflowService input: ${fieldName} cannot be empty.`,
      );
    }
  }
}
