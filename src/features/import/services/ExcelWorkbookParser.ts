import { type ParsedWorkbook } from "../types/ParsedWorkbook";
import {
  type ParseWorkbookRequest,
  type ParseWorkbookResponse,
} from "./ExcelWorkbookParser.worker.types";

/**
 * Parses Excel workbook binary data into a generic workbook structure.
 *
 * Parsing runs in a Web Worker to avoid blocking the main UI thread.
 */
export class ExcelWorkbookParser {
  public async parse(workbookData: ArrayBuffer, workbookName: string): Promise<ParsedWorkbook> {
    this.validateWorkbookData(workbookData);
    this.validateWorkbookName(workbookName);

    return new Promise<ParsedWorkbook>((resolve, reject) => {
      const worker = new Worker(
        new URL("./ExcelWorkbookParser.worker.ts", import.meta.url),
      );

      const cleanup = () => {
        worker.onmessage = null;
        worker.onerror = null;
        worker.terminate();
      };

      worker.onmessage = (event: MessageEvent<ParseWorkbookResponse>) => {
        const response = event.data;

        if (response.type === "parse-success") {
          cleanup();
          resolve(response.workbook);
          return;
        }

        cleanup();
        reject(new Error(response.message));
      };

      worker.onerror = () => {
        cleanup();
        reject(new Error("Unable to parse the Excel file. Please try again."));
      };

      const request: ParseWorkbookRequest = {
        type: "parse-workbook",
        workbookName,
        workbookData,
      };

      worker.postMessage(request, [workbookData]);
    });
  }

  private validateWorkbookData(workbookData: ArrayBuffer): void {
    if (workbookData === null || workbookData === undefined) {
      throw new Error(
        "Invalid ExcelWorkbookParser input: workbookData cannot be null or undefined.",
      );
    }

    if (!(workbookData instanceof ArrayBuffer)) {
      throw new Error(
        "Invalid ExcelWorkbookParser input: workbookData must be an ArrayBuffer.",
      );
    }
  }

  private validateWorkbookName(workbookName: string): void {
    if (workbookName === null || workbookName === undefined) {
      throw new Error(
        "Invalid ExcelWorkbookParser input: workbookName cannot be null or undefined.",
      );
    }

    if (typeof workbookName !== "string") {
      throw new Error(
        "Invalid ExcelWorkbookParser input: workbookName must be a string.",
      );
    }
  }
}
