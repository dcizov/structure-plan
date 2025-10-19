"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { toast } from "sonner";

import { authClient, useSession } from "@/lib/auth/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Session will exist here because parent component checks it
  if (!session?.user) return null;

  const { user } = session;

  /**
   * Handle user sign-out - works identically for all auth methods
   *
   * Better Auth signOut flow (same for email/password, Google OAuth, etc.):
   * 1. Client calls authClient.signOut()
   * 2. Request sent to /api/auth/sign-out
   * 3. Session deleted from database
   * 4. Session cookie cleared automatically
   * 5. Promise resolves
   *
   * Important: Better Auth clears the session cookie even if the server
   * request fails, so the user is effectively logged out client-side.
   *
   * Error cases are rare and usually mean:
   * - Network failure (session might still exist server-side)
   * - Server error (session might not be deleted from DB)
   *
   * The router.refresh() is CRITICAL because:
   * - Better Auth's useSession hook doesn't auto-detect server changes
   * - Next.js router cache must be invalidated
   * - Middleware needs to re-evaluate with the cleared cookie
   */
  async function handleSignOut() {
    setIsLoggingOut(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Session successfully deleted from database and cookie cleared
            toast.success("Logged out successfully");
          },
          onError: (ctx) => {
            // Server-side error (network issue or database error)
            // Cookie is still cleared client-side, but server session might persist
            console.error("Server sign-out error:", ctx.error);
            toast.error("Sign out completed with warnings", {
              description:
                "You've been logged out locally. If issues persist, clear your cookies.",
            });
          },
        },
      });
    } catch (error) {
      // Unexpected error (network failure, etc.)
      // This is rare - Better Auth's signOut is designed to be very reliable
      console.error("Unexpected sign-out error:", error);
      toast.error("Sign out completed", {
        description:
          "There was a network issue, but you've been logged out locally.",
      });
    } finally {
      // Always execute cleanup - user is logged out client-side regardless
      setIsLoggingOut(false);

      // Redirect to home page
      router.push("/");

      // CRITICAL: Trigger middleware re-evaluation and clear Next.js cache
      // Without this, UI will show stale logged-in state until manual refresh
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full"
          disabled={isLoggingOut}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="text-xs">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{user.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push("/dashboard")}
            className="cursor-pointer"
            disabled={isLoggingOut}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/profile")}
            className="cursor-pointer"
            disabled={isLoggingOut}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="cursor-pointer"
            disabled={isLoggingOut}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive cursor-pointer"
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
