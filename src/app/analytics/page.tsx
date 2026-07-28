import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default function AnalyticsPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="This page will present reporting, metrics, and insights for QA operations."
        />
        <EmptyState
          title="Analytics views coming soon"
          description="The analytics shell is ready for future charts, summaries, and trends."
        />
      </div>
    </AuthenticatedLayout>
  );
}
