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

export function DangerZone() {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible account actions - proceed with caution
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              Delete
            </Button>
          </ItemActions>
        </Item>
      </CardContent>
    </Card>
  );
}
