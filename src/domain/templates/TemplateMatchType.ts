/**
 * Domain match categories describing how an uploaded template was resolved
 * during template detection.
 */
export enum TemplateMatchType {
  /**
   * No matching template was found.
   */
  NONE = "NONE",

  /**
   * The uploaded template exactly matches a previously known template fingerprint.
   */
  EXACT = "EXACT",

  /**
   * A sufficiently similar template was found using heuristic matching.
   */
  SIMILAR = "SIMILAR",

  /**
   * The template was matched using AI-assisted analysis.
   */
  AI = "AI",
}