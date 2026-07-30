"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateQuestionBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, description: string) => Promise<void>;
}

/**
 * Controlled dialog for creating a Question Bank.
 */
export function CreateQuestionBankDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateQuestionBankDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const trimmedName = name.trim();

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedName) {
      return;
    }

    const trimmedDescription = description.trim();
    await onCreate(trimmedName, trimmedDescription);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Question Bank</DialogTitle>
          <DialogDescription>
            Create a new Question Bank to organize your questions.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="space-y-2">
            <Label htmlFor="question-bank-name">Name</Label>
            <Input
              id="question-bank-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-bank-description">Description</Label>
            <Textarea
              id="question-bank-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!trimmedName}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
