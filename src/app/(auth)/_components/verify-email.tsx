"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type VerificationStatus = "idle" | "verifying" | "success" | "error";

/**
 * Better Auth error type
 * All Better Auth methods return errors with this structure
 */
type BetterAuthError = {
  status?: number;
  message?: string;
  statusText?: string;
};

/**
 * Check if error indicates expired or invalid token
 *
 * @param error - Better Auth error object
 * @returns true if token is expired or invalid
 */
function isTokenError(error: BetterAuthError): boolean {
  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("expired") ||
    message.includes("invalid") ||
    error.status === 401 ||
    error.status === 403
  );
}

export function VerifyEmail({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = React.useState<VerificationStatus>(
    token ? "verifying" : "idle",
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  /**
   * Auto-verify email when component mounts with token
   *
   * Better Auth verifyEmail flow:
   * 1. Validates the verification token
   * 2. If valid: Marks user's email as verified in database
   * 3. If invalid/expired: Returns error
   * 4. Updates session to reflect verified status
   *
   * Token validation:
   * - Tokens are typically valid for 24 hours (configurable)
   * - Each token can only be used once
   * - Tokens are invalidated if user requests a new one
   *
   * Why fetchOptions?
   * - Provides clear separation between success and error handling
   * - Allows custom error messages based on error type
   * - Enables automatic redirect on success
   * - Better error logging and debugging
   */
  React.useEffect(() => {
    if (!token) {
      setStatus("idle");
      return;
    }

    const verificationToken = token;

    async function verifyEmail() {
      try {
        await authClient.verifyEmail({
          query: { token: verificationToken },
          fetchOptions: {
            onSuccess: () => {
              setStatus("success");
              toast.success("Email verified successfully! Redirecting...");

              // Refresh to sync server-side session state
              router.refresh();

              // Redirect to dashboard after brief delay for user to see success
              setTimeout(() => {
                router.push("/dashboard");
              }, 2000);
            },
            onError: (ctx) => {
              const error = ctx.error as BetterAuthError;

              // Determine appropriate error message
              let message: string;
              if (isTokenError(error)) {
                message = "This verification link is invalid or has expired.";
              } else {
                message =
                  error.message ?? "Failed to verify email. Please try again.";
              }

              setErrorMessage(message);
              setStatus("error");
              toast.error(message);
            },
          },
        });
      } catch (error) {
        // Catch unexpected errors (network failures, etc.)
        console.error("[Email Verification Error]", error);
        const message = "An unexpected error occurred during verification";
        setErrorMessage(message);
        setStatus("error");
        toast.error(message);
      }
    }

    void verifyEmail();
  }, [token, router]);

  /**
   * Verifying state
   * Show loading spinner while verification is in progress
   */
  if (status === "verifying") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Loader2
                className="text-primary h-6 w-6 animate-spin"
                aria-hidden="true"
              />
            </div>
            <CardTitle>Verifying your email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  /**
   * Success state
   * Show success message while redirecting to dashboard
   */
  if (status === "success") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2
                className="h-6 w-6 text-green-600"
                aria-hidden="true"
              />
            </div>
            <CardTitle>Email verified!</CardTitle>
            <CardDescription>
              Your email has been verified successfully. Redirecting to your
              dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <Loader2
                className="text-muted-foreground h-5 w-5 animate-spin"
                aria-hidden="true"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Error state
   * Show error message with options to retry or go back
   */
  if (status === "error") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <XCircle
                className="text-destructive h-6 w-6"
                aria-hidden="true"
              />
            </div>
            <CardTitle>Verification failed</CardTitle>
            <CardDescription>
              {errorMessage ??
                "We couldn't verify your email. The link may have expired or is invalid."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to login</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/register">Create new account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Idle state (no token provided)
   * Show instructions to check email for verification link
   */
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
            <Mail className="h-6 w-6 text-blue-600" aria-hidden="true" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a verification link. Click the link in the email
            to verify your account and you&apos;ll be automatically signed in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-border bg-muted/50 rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">
              <strong className="text-foreground font-medium">
                Didn&apos;t receive the email?
              </strong>
              <br />
              Check your spam folder. The verification link expires in 1 hour.
            </p>
          </div>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
