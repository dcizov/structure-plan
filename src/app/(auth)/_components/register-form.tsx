"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSafeCallback } from "@/hooks/use-safe-callbacks";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
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
  FieldSeparator,
} from "@/components/ui/field";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";

type SocialProvider = "google" | "apple";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const callbackUrl = useSafeCallback();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const password = form.watch("password");
  const isSubmitting = form.formState.isSubmitting || isPending;

  React.useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0] as keyof RegisterInput;
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [form.formState.errors, form.formState.submitCount]);

  async function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      try {
        const { data: session, error } = await authClient.signUp.email({
          name: data.name,
          email: data.email,
          password: data.password,
        });

        if (error) {
          if (
            error.message?.toLowerCase().includes("already exists") ||
            error.message?.toLowerCase().includes("duplicate")
          ) {
            form.setError("email", {
              type: "manual",
              message: "An account with this email already exists",
            });
            toast.error("This email is already registered");
          } else {
            toast.error(error.message ?? "Failed to create account");
          }
          return;
        }

        if (!session) {
          toast.error("Failed to create account. Please try again.");
          return;
        }

        toast.success("Account created! Please check your email to verify.");

        // Redirect to verification page
        router.refresh();
        router.push("/verify-email");
      } catch (error) {
        console.error("[Register Error]", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  }

  async function handleSocialSignIn(provider: SocialProvider) {
    if (provider === "apple") {
      toast.info("Apple Sign In is coming soon");
      return;
    }

    startTransition(async () => {
      try {
        const { error } = await authClient.signIn.social({
          provider,
          callbackURL: callbackUrl,
        });

        if (error) {
          toast.error(error.message ?? `Failed to sign in with ${provider}`);
        }
      } catch (error) {
        console.error(`[${provider} Sign In Error]`, error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  }

  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const submitCount = form.formState.submitCount;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            aria-label="Registration form"
          >
            {submitCount > 0 && hasErrors && (
              <FormErrorSummary
                errors={form.formState.errors}
                title="Please correct the following errors:"
              />
            )}

            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleSocialSignIn("google")}
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
                      Signing up...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with email
              </FieldSeparator>

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => {
                  const errorId = `${field.name}-error`;

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Full Name
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
                        type="text"
                        placeholder="John Doe"
                        autoComplete="name"
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

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => {
                  const errorId = `${field.name}-error`;

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Password
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
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
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

      <FieldDescription className="px-6 text-center text-xs text-balance">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:no-underline"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:no-underline"
        >
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
