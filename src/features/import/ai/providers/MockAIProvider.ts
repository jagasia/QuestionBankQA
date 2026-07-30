import { type AIProvider } from "../AIProvider";

/**
 * Mock AI provider used for local integration testing.
 */
export class MockAIProvider implements AIProvider {
  async complete(_prompt: string): Promise<string> {
    return JSON.stringify(
      {
        templateName: "Default Template",
        detectedMappings: {
          Stem: "question",
          "Choice A": "optionA",
          "Choice B": "optionB",
          "Choice C": "optionC",
          "Choice D": "optionD",
          Key: "correctAnswer",
          Explanation: "explanation",
        },
        additionalColumns: [],
        confidenceScore: 0.98,
        reasoning:
          "Column names closely match the canonical question model.",
      },
      null,
      2,
    );
  }
}
