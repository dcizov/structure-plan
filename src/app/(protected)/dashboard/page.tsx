"use client";

import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc/utils";
import { Separator } from "@/components/ui/separator";
import { DashboardError } from "@/app/(protected)/dashboard/_components/dashboard-error";
import { DashboardSkeleton } from "@/app/(protected)/dashboard/_components/dashboard-skeleton";
import { DashboardStats } from "@/app/(protected)/dashboard/_components/dashboard-stats";
import { DirectorySection } from "@/app/(protected)/dashboard/_components/directory-section";
import { SearchSection } from "@/app/(protected)/dashboard/_components/search-section";

export default function DashboardPage() {
  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError,
  } = useQuery(orpc.user.me.queryOptions());

  const {
    data: userDirectory,
    isLoading: directoryLoading,
    error: directoryError,
  } = useQuery(
    orpc.user.list.queryOptions({
      input: { limit: 6, offset: 0 },
    }),
  );

  if (userLoading || directoryLoading) {
    return <DashboardSkeleton />;
  }

  if (userError || directoryError || !currentUser || !userDirectory) {
    return <DashboardError />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser.name}!
          </p>
        </div>
      </div>

      <Separator />

      {/* Quick Stats */}
      <DashboardStats user={currentUser} totalUsers={userDirectory.total} />

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SearchSection />
      </div>

      {/* User Directory */}
      <DirectorySection />
    </div>
  );
}
