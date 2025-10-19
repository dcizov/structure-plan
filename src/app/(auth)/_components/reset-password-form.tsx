"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";

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
 * Better Auth token errors can manifest as:
 * - Error message containing "expired"
 * - Error message containing "invalid"
 * - Status code 401 or 403
 *
 * @param error - Better Auth error object
 * @returns true if token is expired or invalid
 */
function isTokenError(error: BetterAuthError): {
  isExpired: boolean;
  isInvalid: boolean;
} {
  const message = error.message?.toLowerCase() ?? "";

  return {
    isExpired: message.includes("expired"),
    isInvalid:
      message.includes("invalid") ||
      error.status === 401 ||
      error.status === 403,
  };
}

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isPending, startTransition] = React.useTransition();
  const [resetSuccess, setResetSuccess] = React.useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const password = form.watch("password");
  const isSubmitting = form.formState.isSubmitting || isPending;

  /**
   * Focus management for accessibility
   * Automatically scrolls to and focuses the first field with an error
   */
  React.useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(
        errors,
      )[0] as keyof ResetPasswordInput;
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [form.formState.errors, form.formState.submitCount]);

  /**
   * Show validation errors as toast notification
   * Triggered after form submission when validation fails
   */
  React.useEffect(() => {
    const errors = form.formState.errors;
    const submitCount = form.formState.submitCount;

    // Only show toast after user has attempted to submit
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors)
        .map((error) => error?.message)
        .filter(Boolean);

      if (errorMessages.length > 0) {
        toast.error("Please correct the errors in the form", {
          description: errorMessages[0], // Show first error message
        });
      }
    }
  }, [form.formState.errors, form.formState.submitCount]);

  /**
   * Handle password reset
   *
   * Better Auth resetPassword flow:
   * 1. Validates the reset token (checks expiry and authenticity)
   * 2. If valid: Updates user's password in database
   * 3. If invalid/expired: Returns error
   * 4. Invalidates all existing sessions for security
   *
   * Token validation:
   * - Tokens are typically valid for 1 hour (configurable)
   * - Each token can only be used once
   * - Tokens are invalidated if user requests a new one
   *
   * Error handling strategy:
   * - Expired token: Redirect to forgot-password page
   * - Invalid token: Redirect to forgot-password page
   * - Other errors: Show toast, let user retry
   * - Success: Redirect to login page
   *
   * Why fetchOptions?
   * - Provides granular control over success/error handling
   * - Allows custom redirects based on error type
   * - Better error messaging for different failure scenarios
   */
  async function onSubmit(data: ResetPasswordInput) {
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    startTransition(async () => {
      try {
        await authClient.resetPassword({
          newPassword: data.password,
          token,
          fetchOptions: {
            onSuccess: () => {
              setResetSuccess(true);
              toast.success(
                "Password reset successful! Redirecting to login...",
              );

              // Redirect to login after brief delay for user to see success message
              setTimeout(() => {
                router.refresh();
                router.push("/login");
              }, 2000);
            },
            onError: (ctx) => {
              const error = ctx.error as BetterAuthError;
              const tokenError = isTokenError(error);

              if (tokenError.isExpired) {
                toast.error(
                  "Reset link has expired. Please request a new one.",
                );
                // Redirect to forgot-password page after showing error
                setTimeout(() => {
                  router.push("/forgot-password");
                }, 2000);
              } else if (tokenError.isInvalid) {
                toast.error("Invalid reset link. Please request a new one.");
                // Redirect to forgot-password page after showing error
                setTimeout(() => {
                  router.push("/forgot-password");
                }, 2000);
              } else {
                // Generic error - let user retry
                toast.error(error.message ?? "Failed to reset password");
              }
            },
          },
        });
      } catch (error) {
        // Catch unexpected errors (network failures, etc.)
        console.error("[Reset Password Error]", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  }

  /**
   * Invalid/missing token state
   * Show error message and link to request new reset link
   */
  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Invalid reset link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request
              a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/forgot-password">Request new link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Success state
   * Show confirmation message while redirecting to login
   */
  if (resetSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Password reset successful</CardTitle>
            <CardDescription>
              Your password has been reset successfully. Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            aria-label="Reset password form"
          >
            <FieldGroup>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => {
                  const errorId = `${field.name}-error`;

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        New Password
                        <span
                          className="text-destructive"
                          aria-label="required"
                        >
                          {" "}
                          *
                        </span>
                      </FieldLabel>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        aria-required="true"
                        aria-describedby={
                          fieldState.invalid ? errorId : undefined
                        }
                        disabled={isSubmitting}
                        className={cn(
                          fieldState.invalid &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                      />
                      {!fieldState.invalid && password && (
                        <PasswordStrength password={password} />
                      )}
                      {fieldState.invalid && (
                        <FieldError
                          id={errorId}
                          errors={[fieldState.error]}
                          role="alert"
                          aria-live="assertive"
                        />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => {
                  const errorId = `${field.name}-error`;

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Confirm Password
                        <span
                          className="text-destructive"
                          aria-label="required"
                        >
                          {" "}
                          *
                        </span>
                      </FieldLabel>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        aria-required="true"
                        aria-describedby={
                          fieldState.invalid ? errorId : undefined
                        }
                        disabled={isSubmitting}
                        className={cn(
                          fieldState.invalid &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                      />
                      {fieldState.invalid && (
                        <FieldError
                          id={errorId}
                          errors={[fieldState.error]}
                          role="alert"
                          aria-live="assertive"
                        />
                      )}
                    </Field>
                  );
                }}
              />

              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Resetting password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  <Link
                    href="/login"
                    className="underline underline-offset-4 hover:no-underline"
                    tabIndex={isSubmitting ? -1 : 0}
                  >
                    Back to login
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
