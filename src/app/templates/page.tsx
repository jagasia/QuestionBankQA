import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default function TemplatesPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <PageHeader
          title="Templates"
          description="This page will contain reusable templates for question bank structures and review workflows."
        />
        <EmptyState
          title="Templates library coming soon"
          description="The templates section is now scaffolded for future content and management experiences."
        />
      </div>
    </AuthenticatedLayout>
  );
}
