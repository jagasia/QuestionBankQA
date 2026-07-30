import { type ImportedWorkbook } from "../types/ImportedWorkbook";
import { type AIProvider } from "./AIProvider";
import { AIResponseParser } from "./AIResponseParser";
import { PromptBuilder } from "./PromptBuilder";
import { type DetectedTemplate } from "./types/DetectedTemplate";

/**
 * Orchestrates template detection prompt generation and AI completion.
 */
export class TemplateDetectionService {
  private readonly promptBuilder: PromptBuilder;
  private readonly aiResponseParser: AIResponseParser;

  constructor(private readonly aiProvider: AIProvider) {
    this.promptBuilder = new PromptBuilder();
    this.aiResponseParser = new AIResponseParser();
  }

  async detectTemplate(workbook: ImportedWorkbook): Promise<DetectedTemplate> {
    const prompt = await this.promptBuilder.buildTemplateDetectionPrompt(workbook);
    const rawResponse = await this.aiProvider.complete(prompt.content);
    return this.aiResponseParser.parse(rawResponse);
  }
}
