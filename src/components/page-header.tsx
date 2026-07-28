import * as React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function PageHeader({
  title,
  description,
  actions,
  backLink,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/40 pb-5 mb-6">
      {/* Navigation Breadcrumbs / Back button */}
      {(breadcrumbs || backLink) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {backLink && (
            <Link href={backLink.href}>
              <Button variant="ghost" size="sm" className="-ml-2 gap-1.5 h-8">
                <ArrowLeft className="h-4 w-4" />
                <span>{backLink.label}</span>
              </Button>
            </Link>
          )}

          {!backLink && breadcrumbs && breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground transition-colors font-medium">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-normal text-muted-foreground/85">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Title & Description & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm max-w-2xl">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 sm:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
