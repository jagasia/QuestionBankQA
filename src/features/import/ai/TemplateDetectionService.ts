import { type ImportedWorkbook } from "../types/ImportedWorkbook";
import { type AIProvider } from "./AIProvider";
import { PromptBuilder } from "./PromptBuilder";

/**
 * Orchestrates template detection prompt generation and AI completion.
 */
export class TemplateDetectionService {
  private readonly promptBuilder: PromptBuilder;

  constructor(private readonly aiProvider: AIProvider) {
    this.promptBuilder = new PromptBuilder();
  }

  async detectTemplate(workbook: ImportedWorkbook): Promise<string> {
    const prompt = await this.promptBuilder.buildTemplateDetectionPrompt(workbook);
    return this.aiProvider.complete(prompt.content);
  }
}
