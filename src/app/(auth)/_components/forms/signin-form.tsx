"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSafeCallback } from "@/hooks/use-safe-callbacks";
import { signInSchema, type SignInInput } from "@/schemas/auth";
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
 * Convert Better Auth errors to user-friendly messages
 *
 * Status code mapping:
 * - 401: Invalid credentials (wrong email/password)
 * - 403: Email not verified yet
 * - 423: Account locked (security measure)
 * - 429: Rate limited (too many attempts)
 *
 * @param error - Better Auth error object
 * @returns User-friendly error message
 */
function getAuthErrorMessage(error: BetterAuthError): string {
  const errorMessages: Record<number, string> = {
    401: "Invalid email or password",
    403: "Please verify your email before signing in",
    423: "Your account has been locked. Please contact support.",
    429: "Too many sign-in attempts. Please try again later.",
  };

  if (error.status && error.status in errorMessages) {
    return errorMessages[error.status] ?? "Authentication failed";
  }

  return error.message ?? "Authentication failed. Please try again.";
}

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const callbackUrl = useSafeCallback();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting || isPending;

  /**
   * Focus management for accessibility
   * Automatically scrolls to and focuses the first field with an error
   */
  React.useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0] as keyof SignInInput;
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
   * Handle email/password sign-in
   *
   * Better Auth signIn.email flow:
   * 1. Validates credentials against database
   * 2. Creates session if valid
   * 3. Sets session cookie automatically
   * 4. Returns session data or error
   *
   * Error handling strategy:
   * - 401 errors: Show as field-level error on password field
   * - Other errors: Show as toast notification
   * - Unexpected errors: Caught by try/catch, show generic message
   *
   * Why fetchOptions?
   * - Provides more granular control over success/error handling
   * - Allows separation of UI feedback from business logic
   * - Better TypeScript inference for error types
   * - Recommended by Better Auth for production applications
   */
  async function onSubmit(data: SignInInput) {
    startTransition(async () => {
      try {
        const { data: session, error } = await authClient.signIn.email({
          email: data.email,
          password: data.password,
          callbackURL: callbackUrl,
          fetchOptions: {
            onSuccess: () => {
              toast.success("Successfully signed in!");
            },
            onError: (ctx) => {
              const error = ctx.error as BetterAuthError;
              const errorMessage = getAuthErrorMessage(error);

              // Show field-level error for invalid credentials
              // This provides better UX by highlighting the exact field
              if (error.status === 401) {
                form.setError("password", {
                  type: "manual",
                  message: errorMessage,
                });
              } else {
                // Show toast for system errors (verification, rate limit, etc.)
                toast.error(errorMessage);
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
          toast.error("Failed to sign in. Please try again.");
          return;
        }

        // Success - refresh server state and redirect
        // router.refresh() is important to sync server-side session state
        router.refresh();
        router.push(callbackUrl);
      } catch (error) {
        // Catch unexpected errors (network failures, etc.)
        console.error("[Sign-In Error]", error);
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
   * 5. Better Auth exchanges code for tokens and creates session
   *
   * Error handling limitations:
   * - Only pre-redirect errors can be caught here (invalid config, network issues)
   * - Post-redirect errors (user denies permission, OAuth fails) are handled by
   *   Better Auth's callback endpoint and shown on the callback page
   * - The onSuccess callback will NOT fire because the redirect happens first
   *
   * Common pre-redirect errors:
   * - Missing OAuth credentials in environment variables
   * - Network failure before redirect
   * - Invalid provider configuration
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
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            aria-label="Sign-In form"
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
                      Signing in...
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
                name="email"
                control={form.control}
                render={({ field, fieldState }) => {
                  const errorId = `${field.name}-error`;
                  const descriptionId = `${field.name}-description`;

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
                          fieldState.invalid ? errorId : descriptionId
                        }
                        disabled={isSubmitting}
                        className={cn(
                          fieldState.invalid &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                      />
                      {!fieldState.invalid && (
                        <FieldDescription id={descriptionId}>
                          We&apos;ll never share your email with anyone else.
                        </FieldDescription>
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
                name="password"
                control={form.control}
                render={({ field, fieldState }) => {
                  const errorId = `${field.name}-error`;

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center justify-between">
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
                        <Link
                          href="/forgot-password"
                          className="focus:ring-ring text-sm underline-offset-4 hover:underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
                          tabIndex={isSubmitting ? -1 : 0}
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        autoComplete="current-password"
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
                      <Spinner className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="underline underline-offset-4 hover:no-underline"
                    tabIndex={isSubmitting ? -1 : 0}
                  >
                    Sign up
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
