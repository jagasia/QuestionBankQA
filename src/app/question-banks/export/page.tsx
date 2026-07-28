import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default function ExportPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <PageHeader
          title="Export"
          description="This page will handle packaging and exporting question banks for downstream use."
        />
        <EmptyState
          title="Export flow coming soon"
          description="The export route is now scaffolded for future delivery actions."
        />
      </div>
    </AuthenticatedLayout>
  );
}
