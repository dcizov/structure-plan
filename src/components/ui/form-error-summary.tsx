import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface FormErrorSummaryProps {
  errors: Record<string, { message?: string } | undefined>;
  title?: string;
  className?: string;
}

export function FormErrorSummary({
  errors,
  title = "Please fix the following errors:",
  className,
}: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(
    ([_, error]) => error?.message,
  );

  if (errorEntries.length === 0) return null;

  return (
    <Card
      className={cn("border-destructive bg-destructive/10 mb-6 p-4", className)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex gap-3">
        <AlertCircle className="text-destructive h-5 w-5" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-destructive font-semibold">{title}</h3>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {errorEntries.map(([fieldName, error]) => (
              <li key={fieldName} className="text-destructive text-sm">
                <button
                  type="button"
                  className="focus:ring-ring underline underline-offset-2 hover:no-underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  onClick={() => {
                    document.getElementById(fieldName)?.focus();
                  }}
                >
                  {error?.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
