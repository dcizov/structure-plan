"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

const PAGE_SIZE = 6;

export function DirectorySection() {
  const [currentPage, setCurrentPage] = useState(0);

  const { data: userDirectory } = useQuery(
    orpc.user.list.queryOptions({
      input: {
        limit: PAGE_SIZE,
        offset: currentPage * PAGE_SIZE,
      },
    }),
  );

  if (!userDirectory) return null;

  const totalPages = Math.ceil(userDirectory.total / PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>
              Browse all users in the system with pagination
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {userDirectory.total.toLocaleString()} users
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {userDirectory.users.map((user) => (
              <Item key={user.id} variant="outline">
                <ItemMedia>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{user.name}</ItemTitle>
                  <ItemDescription className="truncate">
                    ID: {user.id.slice(0, 12)}...
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-muted-foreground text-sm">
              Showing {currentPage * PAGE_SIZE + 1}-
              {Math.min((currentPage + 1) * PAGE_SIZE, userDirectory.total)} of{" "}
              {userDirectory.total.toLocaleString()} users
            </p>
            <ButtonGroup>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
              >
                Next
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
