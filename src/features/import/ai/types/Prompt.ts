export interface Prompt {
  /**
   * Logical name of the prompt.
   * Example:
   * "template-detection"
   */
  name: string;

  /**
   * Prompt template version.
   * Example:
   * "1.0.0"
   */
  version: string;

  /**
   * Template file used.
   * Example:
   * "detectTemplate.md"
   */
  template: string;

  /**
   * Final rendered prompt.
   */
  content: string;
}
