import { Timestamp } from "firebase/firestore";

import { type QuestionBank } from "@/lib/models/question-bank";
import { QuestionBankRepository } from "@/lib/repositories/question-bank.repository";

/**
 * Business service for QuestionBank operations.
 */
export class QuestionBankService {
  constructor(
    private readonly questionBankRepository: QuestionBankRepository =
      new QuestionBankRepository(),
  ) {}

  /**
   * Validates and creates a new QuestionBank, returning its generated id.
   */
  async create(
    ownerUid: string,
    organizationId: string,
    name: string,
    description?: string,
  ): Promise<string> {
    const trimmedName = name.trim();
    const trimmedDescription = description?.trim();

    if (trimmedName.length === 0) {
      throw new Error("Question bank name cannot be empty.");
    }

    const now = Timestamp.now();

    const questionBank: QuestionBank = {
      organizationId,
      ownerUid,
      name: trimmedName,
      description: trimmedDescription,
      status: "ACTIVE",
      createdBy: ownerUid,
      createdAt: now,
      updatedBy: ownerUid,
      updatedAt: now,
    };

    return this.questionBankRepository.create(questionBank);
  }

  /**
   * Returns a QuestionBank by id, or null when it does not exist.
   */
  async getById(id: string): Promise<QuestionBank | null> {
    return this.questionBankRepository.getById(id);
  }

  /**
   * Lists all QuestionBanks for a user within an organization.
   */
  async getAllForUser(
    ownerUid: string,
    organizationId: string,
  ): Promise<QuestionBank[]> {
    return this.questionBankRepository.getAllForUser(ownerUid, organizationId);
  }

  /**
   * Updates a QuestionBank by delegating to the repository.
   */
  async update(id: string, questionBank: Partial<QuestionBank>): Promise<void> {
    return this.questionBankRepository.update(id, questionBank);
  }

  /**
   * Deletes a QuestionBank permanently by id.
   */
  async deleteById(id: string): Promise<void> {
    return this.questionBankRepository.deleteById(id);
  }
}
