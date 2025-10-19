"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSafeCallback } from "@/hooks/use-safe-callbacks";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Spinner } from "@/components/ui/spinner";

type SocialProvider = "google" | "apple";

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
 * Check if error indicates duplicate email
 *
 * Better Auth can return duplicate email errors in several ways:
 * - Status code 409 (Conflict)
 * - Error message containing "already exists"
 * - Error message containing "duplicate"
 *
 * @param error - Better Auth error object
 * @returns true if error is due to duplicate email
 */
function isDuplicateEmailError(error: BetterAuthError): boolean {
  if (error.status === 409) {
    return true;
  }

  const message = error.message?.toLowerCase() ?? "";
  return message.includes("already exists") || message.includes("duplicate");
}

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

  /**
   * Focus management for accessibility
   * Automatically scrolls to and focuses the first field with an error
   */
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
   * Handle email/password registration
   *
   * Better Auth signUp.email flow:
   * 1. Validates input (email format, password strength)
   * 2. Checks if email already exists
   * 3. Creates user record in database
   * 4. Sends verification email (if email verification enabled)
   * 5. Creates session (or requires verification first, depending on config)
   * 6. Returns session data or error
   *
   * Error handling strategy:
   * - Duplicate email (409): Show as field-level error on email field
   * - Other errors: Show as toast notification
   * - Success: Redirect to verification page
   *
   * Why fetchOptions?
   * - Separates success/error UI feedback from business logic
   * - Provides type-safe error handling
   * - Allows consistent error handling patterns across the app
   * - Recommended by Better Auth documentation
   */
  async function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      try {
        const { data: session, error } = await authClient.signUp.email({
          name: data.name,
          email: data.email,
          password: data.password,
          fetchOptions: {
            onSuccess: () => {
              toast.success(
                "Account created! Please check your email to verify.",
              );
            },
            onError: (ctx) => {
              const error = ctx.error as BetterAuthError;

              // Handle duplicate email - show as field error for better UX
              if (isDuplicateEmailError(error)) {
                form.setError("email", {
                  type: "manual",
                  message: "An account with this email already exists",
                });
                toast.error("This email is already registered");
              } else {
                // Show generic error for other issues
                toast.error(error.message ?? "Failed to create account");
              }
            },
          },
        });

        // Additional error check for type safety
        // fetchOptions.onError already handles the error, but this ensures TypeScript knows
        if (error) {
          return;
        }

        // Validate session exists (should always be true if no error)
        if (!session) {
          toast.error("Failed to create account. Please try again.");
          return;
        }

        // Success - redirect to verification page
        // router.refresh() syncs server-side state
        router.refresh();
        router.push("/verify-email");
      } catch (error) {
        // Catch unexpected errors (network failures, etc.)
        console.error("[Register Error]", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  }

  /**
   * Handle social OAuth sign-in (Google, Apple, etc.)
   *
   * IMPORTANT: OAuth behavior is different from email/password
   *
   * OAuth flow:
   * 1. authClient.signIn.social() is called
   * 2. Browser IMMEDIATELY redirects to provider (Google, Apple, etc.)
   * 3. User authenticates on provider's website
   * 4. Provider redirects back to your app with auth code
   * 5. Better Auth exchanges code for tokens and creates/updates user
   *
   * Error handling limitations:
   * - Only pre-redirect errors can be caught here (invalid config, network issues)
   * - Post-redirect errors are handled by Better Auth's callback endpoint
   * - The onSuccess callback will NOT fire because the redirect happens first
   *
   * Note: OAuth sign-in can be used for both new users (registration)
   * and existing users (login). Better Auth handles this automatically.
   */
  async function handleSocialSignIn(provider: SocialProvider) {
    if (provider === "apple") {
      toast.info("Apple Sign In is coming soon");
      return;
    }

    startTransition(async () => {
      try {
        // Note: This call will redirect immediately on success
        // Code after this won't execute unless there's a pre-redirect error
        await authClient.signIn.social({
          provider,
          callbackURL: callbackUrl,
          fetchOptions: {
            // onSuccess won't be called - redirect happens before it can fire
            onSuccess: () => {
              // This is unreachable for OAuth - kept for API consistency
            },
            // Only catches pre-redirect errors
            onError: (ctx) => {
              const error = ctx.error as BetterAuthError;
              toast.error(
                error.message ??
                  `Failed to initialize ${provider} sign-in. Please try again.`,
              );
            },
          },
        });
      } catch (error) {
        // Only catches errors before redirect (network issues, invalid config)
        console.error(`[${provider} Sign In Error]`, error);
        toast.error(
          "Failed to connect to sign-in provider. Please check your connection.",
        );
      }
    });
  }

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
                      <Spinner className="mr-2" />
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
                      <Spinner className="mr-2" />
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
