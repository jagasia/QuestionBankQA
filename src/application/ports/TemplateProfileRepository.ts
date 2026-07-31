import { TemplateProfile } from "../../domain/templates/TemplateProfile";

/**
 * Application port for loading and storing template profiles.
 */
export interface TemplateProfileRepository {
  /**
   * Returns all template profiles available to the application.
   */
  findAll(): Promise<readonly TemplateProfile[]>;

  /**
   * Returns the template profile matching the provided identifier, when present.
   */
  findById(id: string): Promise<TemplateProfile | undefined>;

  /**
   * Persists the provided template profile state.
   */
  save(profile: TemplateProfile): Promise<void>;
}
