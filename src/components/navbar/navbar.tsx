import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";

import type { Session } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/navbar/nav-menu";
import { NavigationSheet } from "@/components/navbar/navigation-sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";

export default function Navbar({ session }: { session: Session | null }) {
  return (
    <nav className="bg-background h-16 border-b">
      <div className="mx-auto flex h-full max-w-(--breakpoint-xl) items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </Link>

          {/* Desktop Menu */}
          <NavMenu className="hidden md:block" />
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {!session ? (
            <>
              <Button
                asChild
                variant="outline"
                className="hidden sm:inline-flex"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          ) : (
            <UserNav user={session.user} />
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
}
