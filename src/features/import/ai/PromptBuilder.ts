import { type ImportedWorkbook } from "../types/ImportedWorkbook";
import { PromptDataBuilder } from "./PromptDataBuilder";
import { PromptLoader } from "./PromptLoader";
import { type Prompt } from "./types/Prompt";

const DETECT_TEMPLATE_PROMPT_NAME = "detectTemplate.md";
const DETECT_TEMPLATE_PROMPT_LOGICAL_NAME = "template-detection";
const DETECT_TEMPLATE_PROMPT_VERSION = "1.0.0";

/**
 * Builds AI prompts from imported workbook data.
 */
export class PromptBuilder {
  constructor(
    private readonly promptLoader: PromptLoader = new PromptLoader(),
    private readonly promptDataBuilder: PromptDataBuilder = new PromptDataBuilder(),
  ) {}

  /**
   * Builds the template-detection prompt from workbook context.
   */
  async buildTemplateDetectionPrompt(workbook: ImportedWorkbook): Promise<Prompt> {
    const promptTemplate = await this.promptLoader.loadPrompt(
      DETECT_TEMPLATE_PROMPT_NAME,
    );
    const promptData = this.promptDataBuilder.buildTemplateDetectionData(workbook);

    const headersSection = promptData.headers.length > 0
      ? promptData.headers.join("\n")
      : "(No headers detected)";

    const sampleRowsSection = promptData.sampleRows.length > 0
      ? `\`\`\`json\n${JSON.stringify(promptData.sampleRows, null, 2)}\n\`\`\``
      : "```json\n[]\n```";

    const canonicalFieldsSection = promptData.canonicalFields.join("\n");
    const requiredOutputSection = `\`\`\`json\n${promptData.requiredOutput}\n\`\`\``;

    const content = promptTemplate
      .replace("{{WORKBOOK_METADATA}}", promptData.workbookMetadata)
      .replace("{{HEADERS}}", headersSection)
      .replace("{{SAMPLE_ROWS}}", sampleRowsSection)
      .replace("{{CANONICAL_FIELDS}}", canonicalFieldsSection)
      .replace("{{REQUIRED_OUTPUT}}", requiredOutputSection);

    return {
      name: DETECT_TEMPLATE_PROMPT_LOGICAL_NAME,
      version: DETECT_TEMPLATE_PROMPT_VERSION,
      template: DETECT_TEMPLATE_PROMPT_NAME,
      content,
    };
  }
}
