"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { orpc } from "@/lib/orpc/utils";
import { Button } from "@/components/ui/button";

function UserListContent() {
  const { data } = useSuspenseQuery(
    orpc.user.list.queryOptions({ input: { limit: 10 } }),
  );

  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Users ({data.total})</h2>
      <div className="space-y-2">
        {data.users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 rounded-lg border p-4"
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground text-sm">
                ID: {user.id.slice(0, 8)}...
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserListError() {
  return (
    <div className="border-destructive/50 bg-destructive/10 flex flex-col items-center gap-4 rounded-lg border p-6">
      <p className="text-destructive text-sm">
        Failed to load users. Please sign in again.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/sgnin">Sign In</Link>
      </Button>
    </div>
  );
}

function UserListLoading() {
  return <div className="text-muted-foreground text-sm">Loading users...</div>;
}

export function UserList() {
  return (
    <ErrorBoundary fallback={<UserListError />}>
      <Suspense fallback={<UserListLoading />}>
        <UserListContent />
      </Suspense>
    </ErrorBoundary>
  );
}
