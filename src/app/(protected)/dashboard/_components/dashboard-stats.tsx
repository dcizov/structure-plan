"use client";

import { Shield, User, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatsProps {
  user: {
    emailVerified: boolean;
    role?: string | null;
  };
  totalUsers: number;
}

export function DashboardStats({ user, totalUsers }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
          <User className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {user.emailVerified ? "Active" : "Pending"}
          </div>
          <p className="text-muted-foreground text-xs">
            {user.emailVerified
              ? "Profile is complete and verified"
              : "Please verify your email"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalUsers.toLocaleString()}
          </div>
          <p className="text-muted-foreground text-xs">
            Active users in the system
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Role</CardTitle>
          <Shield className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {user.role ?? "user"}
          </div>
          <p className="text-muted-foreground text-xs">
            {user.role === "admin"
              ? "Full system access"
              : "Standard access level"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
