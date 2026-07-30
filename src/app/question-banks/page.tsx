import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function QuestionBanksPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <PageHeader
          title="Question Banks"
          description="Manage your personal question banks."
          actions={(
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Question Bank
            </Button>
          )}
        />

        <EmptyState
          title="No Question Banks found."
          description="Create your first Question Bank to get started."
        />
      </div>
    </AuthenticatedLayout>
  );
}
