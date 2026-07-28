import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default function ReviewPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <PageHeader
          title="Review"
          description="This page will support manual validation and QA review of imported question content."
        />
        <EmptyState
          title="Review workspace coming soon"
          description="The review route is ready for the future inspection and approval flow."
        />
      </div>
    </AuthenticatedLayout>
  );
}
