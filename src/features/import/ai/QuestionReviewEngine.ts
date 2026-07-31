import { type AIProvider } from "./AIProvider";

export interface QuestionReviewInput {
  questionBody: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  topic?: string;
  difficulty?: string;
  marks?: string;
}

export interface QuestionReviewResult {
  correctAnswer: "A" | "B" | "C" | "D";
  correctAnswerPosition: number;
  difficulty: string;
  bloomTaxonomy: string;
  topic: string;
  explanation: string;
  reviewerRemarks: string;
}

/**
 * AI review engine that enriches one question at a time.
 */
export class QuestionReviewEngine {
  constructor(private readonly aiProvider: AIProvider) {
    if (aiProvider === null || aiProvider === undefined) {
      throw new Error("Invalid QuestionReviewEngine: aiProvider is required.");
    }
  }

  public async reviewQuestion(input: QuestionReviewInput): Promise<QuestionReviewResult> {
    this.validateInput(input);

    const prompt = this.buildPrompt(input);
    const rawResponse = await this.aiProvider.complete(prompt);

    return this.parseResponse(rawResponse);
  }

  private buildPrompt(input: QuestionReviewInput): string {
    return [
      "QUESTION_REVIEW_PROMPT",
      "Return only valid JSON with fields:",
      "correctAnswer, correctAnswerPosition, difficulty, bloomTaxonomy, topic, explanation, reviewerRemarks",
      "",
      `Question Body: ${input.questionBody}`,
      `Option A: ${input.optionA}`,
      `Option B: ${input.optionB}`,
      `Option C: ${input.optionC}`,
      `Option D: ${input.optionD}`,
      `Topic: ${input.topic ?? ""}`,
      `Difficulty: ${input.difficulty ?? ""}`,
      `Marks: ${input.marks ?? ""}`,
    ].join("\n");
  }

  private parseResponse(rawResponse: string): QuestionReviewResult {
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawResponse);
    } catch {
      throw new Error("Invalid AI review response: expected valid JSON.");
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid AI review response: root value must be an object.");
    }

    const response = parsed as Record<string, unknown>;
    const correctAnswerRaw = this.requireString(response.correctAnswer, "correctAnswer").toUpperCase();

    if (!["A", "B", "C", "D"].includes(correctAnswerRaw)) {
      throw new Error("Invalid AI review response: correctAnswer must be one of A, B, C, D.");
    }

    const correctAnswerPosition = this.requireInteger(
      response.correctAnswerPosition,
      "correctAnswerPosition",
    );

    return {
      correctAnswer: correctAnswerRaw as "A" | "B" | "C" | "D",
      correctAnswerPosition,
      difficulty: this.requireString(response.difficulty, "difficulty"),
      bloomTaxonomy: this.requireString(response.bloomTaxonomy, "bloomTaxonomy"),
      topic: this.requireString(response.topic, "topic"),
      explanation: this.requireString(response.explanation, "explanation"),
      reviewerRemarks: this.requireString(response.reviewerRemarks, "reviewerRemarks"),
    };
  }

  private validateInput(input: QuestionReviewInput): void {
    this.requireNonEmpty(input.questionBody, "questionBody");
    this.requireNonEmpty(input.optionA, "optionA");
    this.requireNonEmpty(input.optionB, "optionB");
    this.requireNonEmpty(input.optionC, "optionC");
    this.requireNonEmpty(input.optionD, "optionD");
  }

  private requireNonEmpty(value: string, fieldName: string): void {
    if (value.trim().length === 0) {
      throw new Error(`Invalid QuestionReviewInput: ${fieldName} cannot be empty.`);
    }
  }

  private requireString(value: unknown, fieldName: string): string {
    if (typeof value !== "string") {
      throw new Error(`Invalid AI review response: ${fieldName} must be a string.`);
    }

    if (value.trim().length === 0) {
      throw new Error(`Invalid AI review response: ${fieldName} cannot be empty.`);
    }

    return value;
  }

  private requireInteger(value: unknown, fieldName: string): number {
    if (typeof value !== "number" || !Number.isInteger(value)) {
      throw new Error(`Invalid AI review response: ${fieldName} must be an integer.`);
    }

    return value;
  }
}
