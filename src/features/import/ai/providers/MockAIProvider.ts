import { type AIProvider } from "../AIProvider";

/**
 * Mock AI provider used for local integration testing.
 */
export class MockAIProvider implements AIProvider {
  async complete(prompt: string): Promise<string> {
    if (prompt.includes("QUESTION_REVIEW_PROMPT")) {
      const questionBody = this.extractPromptValue(prompt, "Question Body");
      const optionA = this.extractPromptValue(prompt, "Option A");
      const optionB = this.extractPromptValue(prompt, "Option B");
      const optionC = this.extractPromptValue(prompt, "Option C");
      const optionD = this.extractPromptValue(prompt, "Option D");

      const options = [optionA, optionB, optionC, optionD];
      const selectedIndex = this.selectBestOptionIndex(questionBody, options);
      const answerLetter = ["A", "B", "C", "D"][selectedIndex] as "A" | "B" | "C" | "D";

      return JSON.stringify(
        {
          correctAnswer: answerLetter,
          correctAnswerPosition: selectedIndex + 1,
          difficulty: "Medium",
          bloomTaxonomy: "Apply",
          topic: "General",
          explanation:
            `Mock review selected option ${answerLetter} based on lexical similarity heuristics.`,
          reviewerRemarks:
            "Auto-reviewed. Human verification recommended before final approval.",
        },
        null,
        2,
      );
    }

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

  private extractPromptValue(prompt: string, fieldLabel: string): string {
    const regex = new RegExp(`^${fieldLabel}:\\s*(.*)$`, "mi");
    const match = prompt.match(regex);

    return match?.[1]?.trim() ?? "";
  }

  private selectBestOptionIndex(questionBody: string, options: readonly string[]): number {
    const questionTokens = this.tokenize(questionBody);
    const scores = options.map((option) => this.scoreOption(questionTokens, option));
    const maxScore = Math.max(...scores);

    if (maxScore <= 0) {
      return this.fallbackIndex(questionBody, options);
    }

    return scores.findIndex((score) => score === maxScore);
  }

  private scoreOption(questionTokens: readonly string[], option: string): number {
    const optionTokens = new Set(this.tokenize(option));
    let overlap = 0;

    questionTokens.forEach((token) => {
      if (optionTokens.has(token)) {
        overlap += 1;
      }
    });

    return overlap;
  }

  private tokenize(value: string): string[] {
    const stopWords = new Set([
      "the", "a", "an", "is", "are", "to", "of", "in", "on", "for", "with", "and", "or", "by", "from", "what", "which",
    ]);

    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 1 && !stopWords.has(token));
  }

  private fallbackIndex(questionBody: string, options: readonly string[]): number {
    const seed = `${questionBody}|${options.join("|")}`;
    let hash = 0;

    for (let index = 0; index < seed.length; index += 1) {
      hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    }

    return hash % 4;
  }
}
