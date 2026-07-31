/**
 * Domain lifecycle states for an ImportJob.
 *
 * ImportStatus captures the business progression of a single import from creation
 * through execution to a terminal outcome.
 */
export enum ImportStatus {
  /**
   * The import job has been created and registered, but processing has not started.
   */
  Created = "Created",

  /**
   * The import job is currently parsing workbook content into a processable structure.
   */
  Parsing = "Parsing",

  /**
   * The import job is currently identifying the applicable template profile.
   */
  DetectingTemplate = "DetectingTemplate",

  /**
   * The import job is waiting for user confirmation before continuing import execution.
   */
  AwaitingUserApproval = "AwaitingUserApproval",

  /**
   * The import job is importing parsed questions into canonical question records.
   */
  ImportingQuestions = "ImportingQuestions",

  /**
   * The import job has finished successfully and reached a terminal completed state.
   */
  Completed = "Completed",

  /**
   * The import job has ended due to an unrecoverable business failure condition.
   */
  Failed = "Failed",
}