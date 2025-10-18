import { z } from "zod";

import type { AuthUserType } from "@/server/auth";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  role: z.string().nullable().optional(),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable().optional(),
  banExpires: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<AuthUserType>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  image: z.url("Invalid image URL").nullable().optional(),
});

export const PublicUserSchema = UserSchema.pick({
  id: true,
  name: true,
  image: true,
});

export const GetUserByIdSchema = z.object({
  userId: z.string(),
});

export const ListUsersInputSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
});

export const SearchUsersInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
});

export type User = z.infer<typeof UserSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
