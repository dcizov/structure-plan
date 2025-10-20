"use client";

import { Plus, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const customers = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    orders: 12,
    spent: 1234.56,
    status: "active",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    orders: 5,
    spent: 567.89,
    status: "active",
  },
  {
    id: "3",
    name: "Carol White",
    email: "carol@example.com",
    orders: 23,
    spent: 3456.78,
    status: "vip",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david@example.com",
    orders: 1,
    spent: 89.99,
    status: "new",
  },
];

export default function CustomersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>View and manage your customer base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <InputGroup>
              <InputGroupInput
                type="search"
                placeholder="Search customers..."
              />
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {customer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.email}
                      </TableCell>
                      <TableCell>{customer.orders}</TableCell>
                      <TableCell>${customer.spent.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.status === "vip"
                              ? "default"
                              : customer.status === "new"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {customer.status === "vip"
                            ? "VIP"
                            : customer.status === "new"
                              ? "New"
                              : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
