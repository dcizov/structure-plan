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
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";

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

  // Focus management
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

  async function onSubmit(data: ResetPasswordInput) {
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    startTransition(async () => {
      try {
        const { error } = await authClient.resetPassword({
          newPassword: data.password,
          token,
        });

        if (error) {
          if (error.message?.toLowerCase().includes("expired")) {
            toast.error("Reset link has expired. Please request a new one.");
            setTimeout(() => {
              router.push("/forgot-password");
            }, 2000);
          } else if (error.message?.toLowerCase().includes("invalid")) {
            toast.error("Invalid reset link. Please request a new one.");
            setTimeout(() => {
              router.push("/forgot-password");
            }, 2000);
          } else {
            toast.error(error.message ?? "Failed to reset password");
          }
          return;
        }

        setResetSuccess(true);
        toast.success("Password reset successful! Redirecting to login...");

        setTimeout(() => {
          router.refresh();
          router.push("/login");
        }, 2000);
      } catch (error) {
        console.error("[Reset Password Error]", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  }

  // Invalid token state
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

  // Success state
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

  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const submitCount = form.formState.submitCount;

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
            {submitCount > 0 && hasErrors && (
              <FormErrorSummary
                errors={form.formState.errors}
                title="Please correct the following errors:"
              />
            )}

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
