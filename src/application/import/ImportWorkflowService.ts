import { ImportJob } from "../../domain/imports/ImportJob";
import { ImportStatus } from "../../domain/imports/ImportStatus";
import { ColumnMapping } from "../../domain/templates/ColumnMapping";
import { TemplateDetectionService } from "../../domain/templates/TemplateDetectionService";
import { TemplateFingerprintService } from "../../domain/templates/TemplateFingerprintService";
import { TemplateMatchType } from "../../domain/templates/TemplateMatchType";
import { TemplateProfile } from "../../domain/templates/TemplateProfile";

/**
 * Application service that orchestrates the initial import workflow after
 * workbook parsing has already produced domain mappings.
 */
export class ImportWorkflowService {
  /**
   * Creates a new workflow service with injected domain-service dependencies.
   */
  constructor(
    private readonly templateFingerprintService: TemplateFingerprintService,
    private readonly templateDetectionService: TemplateDetectionService,
  ) {
    this.validateDependencies(templateFingerprintService, templateDetectionService);
  }

  /**
   * Starts the import workflow and advances the import aggregate through the
   * initial states needed for exact template detection.
   */
  public startImport(
    importJobId: string,
    requestedBy: string,
    createdAt: Date,
    columnMappings: readonly ColumnMapping[],
    templateProfiles: readonly TemplateProfile[],
  ): ImportJob {
    let importJob = this.createImportJob(importJobId, requestedBy, createdAt);
    importJob = importJob.startParsing();

    const fingerprint = this.templateFingerprintService.generateFingerprint(columnMappings);
    const detectionResult = this.templateDetectionService.detect(fingerprint, templateProfiles);

    switch (detectionResult.getMatchType()) {
      case TemplateMatchType.EXACT:
        importJob = importJob.detectTemplate(detectionResult.getTemplateProfileVersion());
        return importJob.awaitUserApproval();
      case TemplateMatchType.NONE:
        return importJob;
      default:
        throw new Error(
          `Unsupported TemplateMatchType in ImportWorkflowService: '${detectionResult.getMatchType()}'.`,
        );
    }
  }

  /**
   * Validates constructor dependencies used by workflow orchestration.
   */
  private validateDependencies(
    templateFingerprintService: TemplateFingerprintService,
    templateDetectionService: TemplateDetectionService,
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
}
