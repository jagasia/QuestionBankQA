import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type QuestionBank } from "@/lib/models/question-bank";

interface QuestionBankListProps {
  questionBanks: QuestionBank[];
}

/**
 * Presentation-only list for rendering QuestionBank items.
 */
export function QuestionBankList({ questionBanks }: QuestionBankListProps) {
  if (questionBanks.length === 0) {
    return (
      <EmptyState
        title="No Question Banks found."
        description="Create your first Question Bank to get started."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {questionBanks.map((questionBank) => (
        <Card key={questionBank.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle>{questionBank.name}</CardTitle>
              <Badge
                variant={
                  questionBank.status === "ACTIVE" ? "default" : "secondary"
                }
              >
                {questionBank.status}
              </Badge>
            </div>
          </CardHeader>
          {questionBank.description?.trim() ? (
            <CardContent>
              <CardDescription>{questionBank.description.trim()}</CardDescription>
            </CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
