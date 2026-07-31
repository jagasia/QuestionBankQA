import { QuestionStatus } from "./QuestionStatus";

export interface QuestionStatusHistoryEntry {
  status: QuestionStatus;
  changedAt: Date;
}

export interface QuestionLifecycleRecord {
  rowKey: string;
  currentStatus: QuestionStatus;
  history: readonly QuestionStatusHistoryEntry[];
}

export type QuestionLifecycleMap = Record<string, QuestionLifecycleRecord>;

/**
 * Stateless helper service for managing lifecycle states of imported questions.
 */
export class QuestionLifecycleService {
  /**
   * Returns all supported lifecycle statuses in display order.
   */
  public getAllStatuses(): readonly QuestionStatus[] {
    return [
      QuestionStatus.Imported,
      QuestionStatus.PendingAIReview,
      QuestionStatus.AIReviewed,
      QuestionStatus.NeedsHumanReview,
      QuestionStatus.Approved,
      QuestionStatus.Rejected,
      QuestionStatus.Published,
    ];
  }

  /**
   * Ensures each row key has a lifecycle record, preserving existing records.
   */
  public initializeForRows(
    rowKeys: readonly string[],
    existing: QuestionLifecycleMap,
  ): QuestionLifecycleMap {
    const next: QuestionLifecycleMap = {};

    rowKeys.forEach((rowKey) => {
      const current = existing[rowKey];
      if (current) {
        next[rowKey] = current;
        return;
      }

      const now = new Date();
      next[rowKey] = {
        rowKey,
        currentStatus: QuestionStatus.Imported,
        history: [
          {
            status: QuestionStatus.Imported,
            changedAt: now,
          },
        ],
      };
    });

    return next;
  }

  /**
   * Transitions a row to a new status and appends a timestamped history entry.
   */
  public transitionStatus(
    lifecycleMap: QuestionLifecycleMap,
    rowKey: string,
    nextStatus: QuestionStatus,
    changedAt: Date = new Date(),
  ): QuestionLifecycleMap {
    const current = lifecycleMap[rowKey];
    if (!current) {
      throw new Error(
        `Cannot transition lifecycle status: no lifecycle record found for rowKey '${rowKey}'.`,
      );
    }

    if (current.currentStatus === nextStatus) {
      return lifecycleMap;
    }

    return {
      ...lifecycleMap,
      [rowKey]: {
        rowKey,
        currentStatus: nextStatus,
        history: [
          ...current.history,
          {
            status: nextStatus,
            changedAt,
          },
        ],
      },
    };
  }
}
