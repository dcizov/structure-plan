"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Lock, Palette, Shield, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const settingsNav = [
  {
    title: "Profile",
    href: "/dashboard/settings/profile",
    icon: User,
  },
  {
    title: "Account",
    href: "/dashboard/settings/account",
    icon: Lock,
  },
  {
    title: "Appearance",
    href: "/dashboard/settings/appearance",
    icon: Palette,
  },
  {
    title: "Notifications",
    href: "/dashboard/settings/notifications",
    icon: Bell,
  },
  {
    title: "Advanced",
    href: "/dashboard/settings/advanced",
    icon: Shield,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 lg:w-48 lg:flex-col lg:gap-1">
      {settingsNav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              isActive
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start",
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
