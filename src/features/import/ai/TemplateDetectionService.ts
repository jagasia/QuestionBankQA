import { type ImportedWorkbook } from "../types/ImportedWorkbook";
import { type AIProvider } from "./AIProvider";
import { type DetectedTemplate } from "./types/DetectedTemplate";

/**
 * Contract service for AI-assisted template detection.
 */
export class TemplateDetectionService {
  constructor(private readonly aiProvider: AIProvider) {}

  async detectTemplate(_workbook: ImportedWorkbook): Promise<DetectedTemplate> {
    // Reserved for future provider-backed implementation.
    void this.aiProvider;
    throw new Error("Template detection is not implemented.");
  }
}
