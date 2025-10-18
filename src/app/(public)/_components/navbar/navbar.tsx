import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { NavMenu } from "@/app/(public)/_components/navbar/nav-menu";
import { NavbarActions } from "@/app/(public)/_components/navbar/navbar-actions";
import { NavigationSheet } from "@/app/(public)/_components/navbar/navigation-sheet";

export default function Navbar() {
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

          {/* Auth Actions - Client component that fetches its own session */}
          <NavbarActions />

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
}
