import { Separator } from "@/components/ui/separator";

import { SettingsNav } from "../_components/sidebar/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
        <SettingsNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
