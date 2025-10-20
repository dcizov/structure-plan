// app/(protected)/dashboard/orders/page.tsx
"use client";

import { Plus, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";

export default function OrdersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingCart />
              </EmptyMedia>
              <EmptyTitle>No orders yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t received any orders yet. When customers place
                orders, they&apos;ll appear here.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Test Order
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    </div>
  );
}
