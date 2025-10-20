"use client";

import { Calendar, Mail, Settings } from "lucide-react";

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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";

interface ProfileSectionProps {
  user: {
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: Date;
  };
}

export function ProfileSection({ user }: ProfileSectionProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
          View and manage your account information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Item>
            <ItemMedia>
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="text-lg">
                {user.name}
                {user.emailVerified && (
                  <Badge variant="secondary" className="ml-2">
                    Verified
                  </Badge>
                )}
              </ItemTitle>
              <ItemDescription>
                <Mail className="mr-1 inline h-3 w-3" />
                {user.email}
              </ItemDescription>
              <ItemDescription>
                <Calendar className="mr-1 inline h-3 w-3" />
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </ItemActions>
          </Item>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Total Posts</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Following</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Followers</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>

          <Separator />

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
  );
}
