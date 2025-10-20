"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";

export default function AdvancedSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Advanced</h2>
        <p className="text-muted-foreground">
          Manage advanced settings and account deletion
        </p>
      </div>

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Item
            variant="muted"
            className="border-destructive/50 bg-destructive/5"
          >
            <ItemContent>
              <ItemTitle className="text-sm">Delete Account</ItemTitle>
              <ItemDescription>
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </ItemActions>
          </Item>

          <Item variant="muted" className="border-warning/50 bg-warning/5">
            <ItemContent>
              <ItemTitle className="text-sm">Export Data</ItemTitle>
              <ItemDescription>
                Download a copy of all your data before deleting your account.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </ItemActions>
          </Item>
        </CardContent>
      </Card>
    </div>
  );
}
