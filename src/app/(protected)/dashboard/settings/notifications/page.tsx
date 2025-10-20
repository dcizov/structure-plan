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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  securityEmails: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

const notifications = [
  {
    id: "emailNotifications",
    title: "Email Notifications",
    description: "Receive email notifications about your account activity",
    disabled: false,
  },
  {
    id: "marketingEmails",
    title: "Marketing Emails",
    description: "Receive emails about new features and updates",
    disabled: false,
  },
  {
    id: "securityEmails",
    title: "Security Alerts",
    description: "Important security notifications (cannot be disabled)",
    disabled: true,
  },
] as const;

export default function NotificationsSettingsPage() {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      marketingEmails: false,
      securityEmails: true,
    },
  });

  function onSubmit(_data: NotificationsFormValues) {
    toast.success("Notification preferences updated!");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          Configure how you receive notifications
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Manage your email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <FieldGroup>
                {notifications.map((notification) => (
                  <Controller
                    key={notification.id}
                    name={notification.id}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                        className="items-center rounded-lg border p-4"
                      >
                        <FieldContent>
                          <FieldLabel
                            htmlFor={`notification-${notification.id}`}
                            className="text-base"
                          >
                            {notification.title}
                          </FieldLabel>
                          <FieldDescription>
                            {notification.description}
                          </FieldDescription>
                        </FieldContent>
                        <Switch
                          id={`notification-${notification.id}`}
                          name={field.name}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={notification.disabled}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                ))}
              </FieldGroup>

              <Button type="submit">Update preferences</Button>
            </FieldSet>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
