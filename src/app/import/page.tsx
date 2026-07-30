"use client";

import * as React from "react";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MockAIProvider } from "@/features/import/ai/providers/MockAIProvider";
import { TemplateDetectionService } from "@/features/import/ai/TemplateDetectionService";
import { ExcelImportService } from "@/features/import/services/ExcelImportService";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];

export default function ImportPage() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const excelImportService = React.useMemo(() => new ExcelImportService(), []);
  const aiProvider = React.useMemo(() => new MockAIProvider(), []);
  const templateDetectionService = React.useMemo(
    () => new TemplateDetectionService(aiProvider),
    [aiProvider],
  );

  const [selectedFileName, setSelectedFileName] = React.useState("");
  const [promptPreview, setPromptPreview] = React.useState("");
  const [validationMessage, setValidationMessage] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  function isSupportedExcelFile(file: File): boolean {
    const lowerCaseName = file.name.toLowerCase();
    return ACCEPTED_EXTENSIONS.some((extension) =>
      lowerCaseName.endsWith(extension)
    );
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    setValidationMessage(null);
    setPromptPreview("");

    if (!isSupportedExcelFile(file)) {
      setValidationMessage("Please select a valid Excel file (.xlsx or .xls).");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationMessage("File size must be 20 MB or less.");
      event.target.value = "";
      return;
    }

    setIsProcessing(true);
    let importedWorkbook;

    try {
      importedWorkbook = await excelImportService.importWorkbook(file);
    } catch (error) {
      console.error("Failed to parse Excel workbook", error);
      setValidationMessage(
        "We could not parse this Excel file. Please verify the workbook and try again.",
      );
      setIsProcessing(false);
      event.target.value = "";
      return;
    }

    try {
      const detectedTemplate = await templateDetectionService.detectTemplate(
        importedWorkbook,
      );
      setPromptPreview(JSON.stringify(detectedTemplate, null, 2));
    } catch (error) {
      console.error("Failed to generate AI response preview", error);
      setValidationMessage(
        "We could not generate the AI response preview from this workbook. Please try again.",
      );
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          AI Template Detection
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Select Excel File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileSelection}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="button" variant="outline" onClick={openFilePicker}>
                Choose File
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedFileName || "No file selected"}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Supported formats: .xlsx, .xls (max 20 MB)
            </p>

            {validationMessage ? (
              <p className="text-sm text-destructive">{validationMessage}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Raw AI Response Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="prompt-preview">Raw AI Response</Label>
            <Textarea
              id="prompt-preview"
              value={
                promptPreview ||
                (isProcessing
                  ? "Generating AI response preview..."
                  : "Select an Excel file to generate an AI response preview.")
              }
              readOnly
              className="min-h-[360px] resize-y overflow-auto font-mono text-xs leading-relaxed"
            />
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
