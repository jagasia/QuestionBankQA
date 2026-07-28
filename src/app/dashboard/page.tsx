import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="space-y-6">
          <PageHeader
            title="Dashboard"
            description="This space will host the overview experience for monitoring question-bank activity and progress."
          />
          <EmptyState
            title="Dashboard overview coming soon"
            description="The dashboard shell is in place and will soon surface key metrics, recent activity, and status summaries."
          />
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
