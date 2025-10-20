"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    message: "Please select a theme.",
  }),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
] as const;

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (theme as "light" | "dark" | "system") || "system",
    },
  });

  function onSubmit(data: AppearanceFormValues) {
    setTheme(data.theme);
    toast.success("Appearance settings updated!");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
        <p className="text-muted-foreground">
          Customize the appearance of the app
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Select the theme for the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <Controller
                name="theme"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Select theme</FieldLabel>
                    <RadioGroup
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid gap-4 sm:grid-cols-3"
                    >
                      {themes.map((themeOption) => {
                        const Icon = themeOption.icon;
                        return (
                          <div key={themeOption.id}>
                            <RadioGroupItem
                              value={themeOption.id}
                              id={`theme-${themeOption.id}`}
                              className="peer sr-only"
                              aria-invalid={fieldState.invalid}
                            />
                            <Label
                              htmlFor={`theme-${themeOption.id}`}
                              className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4"
                            >
                              <Icon className="mb-3 h-6 w-6" />
                              {themeOption.label}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                    <FieldDescription>
                      Choose how the interface looks. System follows your OS
                      preference.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button type="submit">Update preferences</Button>
            </FieldSet>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
