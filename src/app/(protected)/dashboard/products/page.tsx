"use client";

import { Package, Plus, Search } from "lucide-react";

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

const products = [
  {
    id: "1",
    name: "Wireless Headphones",
    sku: "WH-001",
    price: 79.99,
    stock: 45,
    status: "active",
  },
  {
    id: "2",
    name: "Smart Watch",
    sku: "SW-002",
    price: 199.99,
    stock: 23,
    status: "active",
  },
  {
    id: "3",
    name: "Laptop Stand",
    sku: "LS-003",
    price: 49.99,
    stock: 0,
    status: "out_of_stock",
  },
  {
    id: "4",
    name: "USB-C Cable",
    sku: "UC-004",
    price: 12.99,
    stock: 156,
    status: "active",
  },
  {
    id: "5",
    name: "Mechanical Keyboard",
    sku: "MK-005",
    price: 129.99,
    stock: 8,
    status: "low_stock",
  },
];

export default function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            View and manage your product catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <InputGroup>
              <InputGroupInput type="search" placeholder="Search products..." />
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md border">
                            <Package className="h-5 w-5" />
                          </div>
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.sku}
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.status === "active"
                              ? "default"
                              : product.status === "low_stock"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {product.status === "active"
                            ? "Active"
                            : product.status === "low_stock"
                              ? "Low Stock"
                              : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
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
