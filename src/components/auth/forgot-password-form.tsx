"use client";

import * as React from "react";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth";
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
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [success, setSuccess] = React.useState(false);

  const form: UseFormReturn<ForgotPasswordInput> = useForm<ForgotPasswordInput>(
    {
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: { email: "" },
      mode: "onSubmit",
    },
  );

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<ForgotPasswordInput> = async (values) => {
    try {
      const { error } = await authClient.forgetPassword({
        email: values.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(error.message ?? "Failed to send reset email");
        return;
      }

      toast.success("Password reset link sent! Check your email.");
      setSuccess(true);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent you a password reset link. Please check your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
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
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit(onSubmit)(e);
              }}
              noValidate
            >
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="email"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<ForgotPasswordInput, "email">;
                  }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          autoComplete="email"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Field>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                  <FieldDescription className="text-center">
                    Remember your password?{" "}
                    <Link
                      href="/login"
                      className="underline underline-offset-4"
                    >
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
