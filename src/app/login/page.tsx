"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  async function handleGoogleSignIn() {
    if (!auth) {
      return;
    }

    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleSignOut() {
    if (!auth) {
      return;
    }

    await signOut(auth);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/70 shadow-lg shadow-black/5">
        <CardHeader className="space-y-2">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">QuestionBankQA</div>
          <CardTitle className="text-2xl">Sign in to continue</CardTitle>
          <CardDescription>
            Use your Google account to access the review workspace and manage question banks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">You are already signed in.</p>
              <Button className="w-full" onClick={() => router.push("/dashboard")}>
                Continue to dashboard
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={handleGoogleSignIn} disabled={isSigningIn}>
              <LogIn className="mr-2 h-4 w-4" />
              {isSigningIn ? "Signing in..." : "Continue with Google"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
