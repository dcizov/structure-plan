"use client";

import Link from "next/link";

import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserNav } from "@/components/user-nav";

export function NavbarActions() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Button asChild variant="outline" className="hidden sm:inline-flex">
          <Link href="/signin">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </>
    );
  }

  return <UserNav />;
}
