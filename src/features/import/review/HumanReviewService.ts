import { QuestionStatus } from "../lifecycle/QuestionStatus";

export enum HumanReviewAction {
  Accept = "Accept",
  Reject = "Reject",
  Modify = "Modify",
}

export interface HumanReviewEntry {
  action: HumanReviewAction;
  reviewedBy: string;
  reviewedOn: Date;
  comments: string;
  resultingStatus: QuestionStatus;
}

export interface HumanReviewRecord {
  rowKey: string;
  latest: HumanReviewEntry;
  history: readonly HumanReviewEntry[];
}

export type HumanReviewMap = Record<string, HumanReviewRecord>;

export interface SubmitHumanReviewInput {
  rowKey: string;
  action: HumanReviewAction;
  reviewedBy: string;
  comments: string;
  reviewedOn?: Date;
}

/**
 * Stateless helper for recording human review decisions.
 */
export class HumanReviewService {
  public submitReview(
    currentMap: HumanReviewMap,
    input: SubmitHumanReviewInput,
  ): HumanReviewMap {
    this.validateInput(input);

    const reviewedOn = input.reviewedOn ?? new Date();
    const resultingStatus = this.resolveStatus(input.action);
    const nextEntry: HumanReviewEntry = {
      action: input.action,
      reviewedBy: input.reviewedBy.trim(),
      reviewedOn,
      comments: input.comments.trim(),
      resultingStatus,
    };

    const previous = currentMap[input.rowKey];
    const history = previous ? [...previous.history, nextEntry] : [nextEntry];

    return {
      ...currentMap,
      [input.rowKey]: {
        rowKey: input.rowKey,
        latest: nextEntry,
        history,
      },
    };
  }

  public resolveStatus(action: HumanReviewAction): QuestionStatus {
    switch (action) {
      case HumanReviewAction.Accept:
        return QuestionStatus.Approved;
      case HumanReviewAction.Reject:
        return QuestionStatus.Rejected;
      case HumanReviewAction.Modify:
      default:
        return QuestionStatus.NeedsHumanReview;
    }
  }

  private validateInput(input: SubmitHumanReviewInput): void {
    if (!input.rowKey || input.rowKey.trim().length === 0) {
      throw new Error("Invalid HumanReview input: rowKey is required.");
    }

    if (!input.reviewedBy || input.reviewedBy.trim().length === 0) {
      throw new Error("Invalid HumanReview input: reviewedBy is required.");
    }
  }
}
