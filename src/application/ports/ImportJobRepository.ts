import { ImportJob } from "../../domain/imports/ImportJob";

/**
 * Application port for loading and storing import jobs.
 */
export interface ImportJobRepository {
  /**
   * Returns the import job matching the provided identifier, when present.
   */
  findById(id: string): Promise<ImportJob | undefined>;

  /**
   * Persists a newly created import job state.
   */
  save(job: ImportJob): Promise<void>;

  /**
   * Persists updates to an existing import job state.
   */
  update(job: ImportJob): Promise<void>;
}
