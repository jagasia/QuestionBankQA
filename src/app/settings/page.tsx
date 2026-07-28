import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default function SettingsPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="This page will hold configuration and workspace preferences for the application."
        />
        <EmptyState
          title="Settings area coming soon"
          description="The settings route is now scaffolded for future configuration controls."
        />
      </div>
    </AuthenticatedLayout>
  );
}
