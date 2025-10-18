// src/app/(auth)/_components/forgot-password-form.tsx
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
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import { Input } from "@/components/ui/input";

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

  async function onSubmit(data: ForgotPasswordInput) {
    startTransition(async () => {
      try {
        const { error } = await authClient.forgetPassword({
          email: data.email,
          redirectTo: "/reset-password",
        });

        if (error) {
          // Don't reveal if email exists for security
          // But still show user-friendly message
          console.error("[Forgot Password Error]", error);
        }

        // Always show success to prevent email enumeration
        setEmailSent(true);
        toast.success("If an account exists, you'll receive a reset link");
      } catch (error) {
        console.error("[Forgot Password Error]", error);
        // Still show success message for security
        setEmailSent(true);
        toast.success("If an account exists, you'll receive a reset link");
      }
    });
  }

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

  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const submitCount = form.formState.submitCount;

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
            {submitCount > 0 && hasErrors && (
              <FormErrorSummary
                errors={form.formState.errors}
                title="Please correct the following errors:"
              />
            )}

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
