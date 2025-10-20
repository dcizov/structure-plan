// app/(protected)/dashboard/_components/sidebar/search-command.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Home,
  Package,
  Search as SearchIcon,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const navigationItems = [
  {
    heading: "Pages",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Products",
        url: "/dashboard/products",
        icon: Package,
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: ShoppingCart,
      },
      {
        title: "Customers",
        url: "/dashboard/customers",
        icon: Users,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    heading: "Settings",
    items: [
      {
        title: "Profile",
        url: "/dashboard/settings/profile",
        icon: Settings,
      },
      {
        title: "Account",
        url: "/dashboard/settings/account",
        icon: Settings,
      },
      {
        title: "Appearance",
        url: "/dashboard/settings/appearance",
        icon: Settings,
      },
      {
        title: "Notifications",
        url: "/dashboard/settings/notifications",
        icon: Settings,
      },
      {
        title: "Advanced",
        url: "/dashboard/settings/advanced",
        icon: Settings,
      },
    ],
  },
];

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-9 w-full items-center gap-2 rounded-md border px-3 text-sm transition-colors group-data-[collapsible=icon]:hidden"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="flex-1 text-left">Search...</span>
        <KbdGroup className="hidden sm:flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {navigationItems.map((group) => (
            <React.Fragment key={group.heading}>
              <CommandGroup heading={group.heading}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.url}
                      value={item.title}
                      onSelect={() => {
                        runCommand(() => router.push(item.url));
                      }}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {group !== navigationItems[navigationItems.length - 1] && (
                <CommandSeparator />
              )}
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
