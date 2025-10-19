"use client";

import * as React from "react";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth";
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
import { Input } from "@/components/ui/input";

/**
 * Better Auth error type
 * All Better Auth methods return errors with this structure
 */
type BetterAuthError = {
  status?: number;
  message?: string;
  statusText?: string;
};

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, startTransition] = React.useTransition();
  const [emailSent, setEmailSent] = React.useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting || isPending;

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
   * Handle forgot password request
   *
   * Better Auth forgetPassword flow:
   * 1. Accepts email address
   * 2. Checks if user exists in database
   * 3. If exists: Generates reset token and sends email
   * 4. If not exists: Still returns success (security measure)
   * 5. Returns success regardless to prevent email enumeration
   *
   * Security consideration - Email enumeration prevention:
   * We ALWAYS show success message, even if the email doesn't exist.
   * This prevents attackers from using this form to discover valid email addresses.
   *
   * Better Auth handles this automatically - it returns success even for
   * non-existent emails. We maintain this security pattern in our UI.
   *
   * Why fetchOptions?
   * - Consistent error handling pattern
   * - Allows graceful handling of unexpected errors
   * - Maintains security by not revealing email existence
   */
  async function onSubmit(data: ForgotPasswordInput) {
    startTransition(async () => {
      try {
        await authClient.forgetPassword({
          email: data.email,
          redirectTo: "/reset-password",
          fetchOptions: {
            onSuccess: () => {
              // Don't reveal if email exists - always show success
              setEmailSent(true);
              toast.success(
                "If an account exists, you'll receive a reset link",
              );
            },
            onError: (ctx) => {
              const error = ctx.error as BetterAuthError;

              // Log error for debugging but don't expose to user
              console.error("[Forgot Password Error]", error);

              // Still show success to prevent email enumeration
              setEmailSent(true);
              toast.success(
                "If an account exists, you'll receive a reset link",
              );
            },
          },
        });
      } catch (error) {
        // Catch unexpected errors (network failures, etc.)
        console.error("[Forgot Password Error]", error);

        // Still show success message for security
        // Users will know there's an issue if they don't receive the email
        setEmailSent(true);
        toast.success("If an account exists, you'll receive a reset link");
      }
    });
  }

  // Success state - show confirmation and option to resend
  if (emailSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              If an account exists with that email, we&apos;ve sent you a
              password reset link. Please check your inbox and spam folder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setEmailSent(false)}
            >
              Send another link
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            aria-label="Forgot password form"
          >
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => {
                  const errorId = `${field.name}-error`;

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Email
                        <span
                          className="text-destructive"
                          aria-label="required"
                        >
                          {" "}
                          *
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
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
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="underline underline-offset-4 hover:no-underline"
                    tabIndex={isSubmitting ? -1 : 0}
                  >
                    Sign in
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
