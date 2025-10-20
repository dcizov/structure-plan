"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  FieldSet,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";

const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    newPassword: z
      .string()
      .min(1, { message: "New password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((val) => /[0-9]/.test(val), {
        message: "Password must contain at least one number",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function AccountSettingsPage() {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(_data: PasswordFormValues) {
    toast.success("Password updated successfully!");
    form.reset();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-muted-foreground">
          Manage your account security settings
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <FieldGroup>
                <Controller
                  name="currentPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Current Password
                      </FieldLabel>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        placeholder="Enter current password"
                        aria-invalid={fieldState.invalid}
                        autoComplete="current-password"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="newPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        placeholder="Enter new password"
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                      />
                      <FieldDescription>
                        Must be at least 8 characters with uppercase, lowercase,
                        and number.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Confirm New Password
                      </FieldLabel>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        placeholder="Confirm new password"
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <div className="flex gap-2">
                <Button type="submit">Update Password</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
              </div>
            </FieldSet>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-muted-foreground text-sm">
                Two-factor authentication is not enabled
              </p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
