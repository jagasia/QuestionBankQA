import { Timestamp } from "firebase/firestore";

/**
 * Shared lifecycle status for domain entities.
 */
export type EntityStatus = "ACTIVE" | "ARCHIVED";

/**
 * Represents a question bank owned by an organization user.
 */
export interface QuestionBank {
  /** Optional unique identifier for the question bank. */
  id?: string;

  /** Organization identifier that owns this question bank. */
  organizationId: string;

  /** UID of the user who owns this question bank. */
  ownerUid: string;

  /** Display name of the question bank. */
  name: string;

  /** Optional description of the question bank. */
  description?: string;

  /** Lifecycle status of the question bank. */
  status: EntityStatus;

  /** UID of the user who created this question bank. */
  createdBy: string;

  /** Timestamp when the question bank was created. */
  createdAt: Timestamp;

  /** UID of the user who last updated this question bank. */
  updatedBy: string;

  /** Timestamp when the question bank was last updated. */
  updatedAt: Timestamp;
}
