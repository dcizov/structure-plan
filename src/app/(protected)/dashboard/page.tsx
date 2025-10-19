import {
  Calendar,
  Mail,
  Search,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile and explore the user directory
          </p>
        </div>
      </div>

      <Separator />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-muted-foreground text-xs">
              Profile is complete and verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
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
            <div className="text-2xl font-bold">User</div>
            <p className="text-muted-foreground text-xs">
              Standard access level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Current User Profile - Uses userRouter.me */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              View and manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">John Doe</h3>
                    <Badge variant="secondary">Verified</Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Mail className="h-3 w-3" />
                    john.doe@example.com
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    Joined March 2024
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <Separator />

              {/* Profile Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Posts</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Following</p>
                  <p className="text-2xl font-bold">128</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Followers</p>
                  <p className="text-2xl font-bold">89</p>
                </div>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="default" className="flex-1">
                  Update Profile
                </Button>
                <Button variant="outline" className="flex-1">
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Search - Uses userRouter.search */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
            <CardDescription>Find and connect with other users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search by name..."
                  className="pl-8"
                />
              </div>

              {/* Search Results */}
              <div className="space-y-3">
                {[
                  { name: "Alice Johnson", role: "Designer", avatar: "AJ" },
                  { name: "Bob Smith", role: "Developer", avatar: "BS" },
                  { name: "Carol White", role: "Manager", avatar: "CW" },
                  { name: "David Brown", role: "Analyst", avatar: "DB" },
                ].map((user, i) => (
                  <div
                    key={i}
                    className="hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-xs">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                View All Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Directory - Uses userRouter.list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>
                Browse all users in the system with pagination
              </CardDescription>
            </div>
            <Badge variant="secondary">2,350 users</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* User List */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Emma Wilson", email: "emma@example.com", image: null },
                {
                  name: "Frank Miller",
                  email: "frank@example.com",
                  image: null,
                },
                { name: "Grace Lee", email: "grace@example.com", image: null },
                { name: "Henry Chen", email: "henry@example.com", image: null },
                { name: "Ivy Martinez", email: "ivy@example.com", image: null },
                { name: "Jack Davis", email: "jack@example.com", image: null },
              ].map((user, i) => (
                <div
                  key={i}
                  className="hover:bg-accent flex items-start gap-3 rounded-lg border p-4 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="text-sm leading-none font-medium">
                      {user.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-muted-foreground text-sm">
                Showing 1-6 of 2,350 users
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions - Uses userRouter.updateProfile & deleteAccount */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible account actions - proceed with caution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-destructive/50 bg-destructive/5 flex items-start justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-muted-foreground text-xs">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
