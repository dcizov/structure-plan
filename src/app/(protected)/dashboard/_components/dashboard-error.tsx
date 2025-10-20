// dashboard-error.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardError() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="border-destructive/50 max-w-md">
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <p className="text-destructive font-medium">
              Failed to load dashboard
            </p>
            <p className="text-muted-foreground text-sm">
              Please try refreshing the page or contact support if the problem
              persists.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
