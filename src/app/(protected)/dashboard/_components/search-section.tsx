"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";

import { orpc } from "@/lib/orpc/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: searchResults, isFetching: searchFetching } = useQuery({
    ...orpc.user.search.queryOptions({
      input: {
        query: debouncedQuery || "a",
        limit: 4,
      },
    }),
    enabled: debouncedQuery.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Search Users</CardTitle>
        <CardDescription>Find and connect with other users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <InputGroup>
            <InputGroupInput
              type="search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroupAddon>
              {searchFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </InputGroupAddon>
          </InputGroup>

          <div className="space-y-3">
            {searchQuery.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Start typing to search users
              </p>
            ) : !searchResults || searchResults.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No users found matching {searchQuery}
              </p>
            ) : (
              <div
                className={`space-y-3 ${searchFetching ? "pointer-events-none opacity-50" : ""}`}
              >
                {searchResults.map((user) => (
                  <Item key={user.id} variant="outline" size="sm">
                    <ItemMedia>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{user.name}</ItemTitle>
                      <ItemDescription>
                        ID: {user.id.slice(0, 8)}...
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </ItemActions>
                  </Item>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" className="w-full">
            View All Users
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
