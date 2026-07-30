"use client";

import * as React from "react";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { useAuth } from "@/components/auth/auth-provider";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { QuestionBankList } from "@/features/question-banks/components/QuestionBankList";
import { type QuestionBank } from "@/lib/models/question-bank";
import { QuestionBankService } from "@/lib/services/question-bank.service";
import { Plus } from "lucide-react";

export default function QuestionBanksPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const questionBankService = React.useMemo(() => new QuestionBankService(), []);
  const [questionBanks, setQuestionBanks] = React.useState<QuestionBank[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isPageLoading = authLoading || isLoading;

  const loadQuestionBanks = React.useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!user) {
      if (isMountedRef.current) {
        setQuestionBanks([]);
        setIsLoading(false);
        setErrorMessage("Unable to load Question Banks right now.");
      }
      return;
    }

    try {
      if (isMountedRef.current) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      const organizationId = profile?.organizationId?.trim();

      if (!organizationId) {
        throw new Error("organizationId is missing from the user profile.");
      }

      const items = await questionBankService.getAllForUser(user.uid, organizationId);
      if (isMountedRef.current) {
        setQuestionBanks(items);
      }
    } catch (error) {
      console.error("Failed to load Question Banks", error);
      if (isMountedRef.current) {
        setQuestionBanks([]);
        setErrorMessage("Unable to load Question Banks right now.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [authLoading, profile, questionBankService, user]);

  React.useEffect(() => {
    void loadQuestionBanks();
  }, [loadQuestionBanks]);

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

        {isPageLoading ? (
          <LoadingSkeleton />
        ) : errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : (
          <QuestionBankList questionBanks={questionBanks} />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
