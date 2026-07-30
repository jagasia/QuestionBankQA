/**
 * Provider-agnostic contract for AI text completion.
 */
export interface AIProvider {
  complete(prompt: string): Promise<string>;
}
