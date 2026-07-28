import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default function ImportPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <PageHeader
          title="Import"
          description="This page will provide the intake workflow for bringing question banks into the system."
        />
        <EmptyState
          title="Import experience coming soon"
          description="The route and placeholder shell are ready for the future import experience."
        />
      </div>
    </AuthenticatedLayout>
  );
}
