import {
  GetUserByIdSchema,
  ListUsersInputSchema,
  PublicUserSchema,
  SearchUsersInputSchema,
  UpdateProfileSchema,
  UserSchema,
} from "@/schemas/user";
import { ORPCError } from "@orpc/server";
import { count, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "@/server/api/orpc";
import { user } from "@/server/db/schema";

export const userRouter = {
  me: protectedProcedure.output(UserSchema).handler(async ({ context }) => {
    const userId = context.session.user.id;

    const [dbUser] = await context.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!dbUser) {
      throw new ORPCError("NOT_FOUND", {
        message: "User not found",
      });
    }

    return dbUser;
  }),

  updateProfile: protectedProcedure
    .input(UpdateProfileSchema)
    .output(UserSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const [updatedUser] = await context.db
        .update(user)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
        .returning();

      if (!updatedUser) {
        throw new ORPCError("NOT_FOUND", {
          message: "User not found",
        });
      }

      return updatedUser;
    }),

  deleteAccount: protectedProcedure
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context }) => {
      const userId = context.session.user.id;
      await context.db.delete(user).where(eq(user.id, userId));
      return { success: true };
    }),

  getById: publicProcedure
    .input(GetUserByIdSchema)
    .output(PublicUserSchema)
    .handler(async ({ input, context }) => {
      const [dbUser] = await context.db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
        })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!dbUser) {
        throw new ORPCError("NOT_FOUND", {
          message: "User not found",
        });
      }

      return dbUser;
    }),

  list: publicProcedure
    .input(ListUsersInputSchema)
    .output(
      z.object({
        users: z.array(PublicUserSchema),
        total: z.number(),
      }),
    )
    .handler(async ({ input, context }) => {
      const usersQuery = context.db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
        })
        .from(user);

      const users = input.search
        ? await usersQuery
            .where(ilike(user.name, `%${input.search}%`))
            .limit(input.limit)
            .offset(input.offset)
        : await usersQuery.limit(input.limit).offset(input.offset);

      const countQuery = context.db.select({ value: count() }).from(user);
      const [result] = input.search
        ? await countQuery.where(ilike(user.name, `%${input.search}%`))
        : await countQuery;

      return {
        users,
        total: result?.value ?? 0,
      };
    }),

  search: protectedProcedure
    .input(SearchUsersInputSchema)
    .output(z.array(PublicUserSchema))
    .handler(async ({ input, context }) => {
      const users = await context.db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
        })
        .from(user)
        .where(ilike(user.name, `%${input.query}%`))
        .limit(input.limit);

      return users;
    }),
};
