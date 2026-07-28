import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function Home() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <PageHeader
          title="Welcome back"
          description="A polished UI foundation for QuestionBankQA with dark mode, shared layout, and reusable components."
          actions={
            <Link href="/campaigns">
              <Button>
                Explore campaigns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                UI foundation ready
              </div>
              <CardTitle>What is included</CardTitle>
              <CardDescription>
                The app now uses shared shadcn-inspired primitives, a theme-aware shell, and reusable UI helpers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Theme provider and dark/light mode toggle",
                "Responsive authenticated layout with navigation",
                "Reusable page header, empty state, loading skeleton, and confirm dialog",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next step</CardTitle>
              <CardDescription>Use the shared foundation to build QA flows, forms, and dashboards.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link href="/templates">
                <Button variant="outline">View templates</Button>
              </Link>
              <Link href="/reports">
                <Button variant="secondary">Open reports</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
