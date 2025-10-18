"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSafeCallback } from "@/hooks/use-safe-callbacks";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type {
  ControllerRenderProps,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";

import { authClient } from "@/server/auth/client";
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
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type SocialProvider = "google" | "apple";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "An unexpected error occurred";
}

function RegisterFormInner({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const callbackUrl = useSafeCallback();

  const form: UseFormReturn<RegisterInput> = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<RegisterInput> = async (values) => {
    try {
      const { data, error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: callbackUrl,
      });

      if (error) {
        toast.error(error.message ?? "Failed to register");
        return;
      }
      if (!data) {
        toast.error("Failed to register");
        return;
      }

      toast.success("Account created. Welcome!");
      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  async function handleSocial(provider: SocialProvider): Promise<void> {
    if (provider === "apple") {
      toast.info("Apple Sign In is not configured yet");
      return;
    }
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl,
      });
      if (error) toast.error(error.message ?? `Failed with ${provider}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Continue with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit(onSubmit)(e);
              }}
              noValidate
            >
              <FieldGroup>
                {/* Social buttons stacked vertically */}
                <Field className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => void handleSocial("google")}
                    disabled={form.formState.isSubmitting}
                    className="w-full"
                  >
                    <svg
                      aria-hidden="true"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      className="mr-2"
                    >
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>

                <FormField
                  control={form.control}
                  name="name"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<RegisterInput, "name">;
                  }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          autoComplete="name"
                          placeholder="Jane Doe"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<RegisterInput, "email">;
                  }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="jane@example.com"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<RegisterInput, "password">;
                  }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          minLength={8}
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
                  {form.formState.isSubmitting
                    ? "Creating account..."
                    : "Sign up"}
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link href="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link href="/terms">Terms of Service</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}

// Export both named and default to support either import style
export { RegisterFormInner as RegisterForm };
export default RegisterFormInner;
