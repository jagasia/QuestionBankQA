import { type ImportedWorkbook } from "../types/ImportedWorkbook";
import { type AIProvider } from "./AIProvider";
import { PromptBuilder } from "./PromptBuilder";
import { MockAIProvider } from "./providers/MockAIProvider";

/**
 * Orchestrates template detection prompt generation and AI completion.
 */
export class TemplateDetectionService {
  constructor(
    private readonly aiProvider: AIProvider = new MockAIProvider(),
    private readonly promptBuilder: PromptBuilder = new PromptBuilder(),
  ) {}

  async detectTemplate(workbook: ImportedWorkbook): Promise<string> {
    const prompt = await this.promptBuilder.buildTemplateDetectionPrompt(workbook);
    return this.aiProvider.complete(prompt.content);
  }
}
