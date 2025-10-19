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

/**
 * User Router - Demonstrates multi-layer security pattern
 *
 * Security Architecture:
 * ┌─────────────────────────────────────────────────────────┐
 * │ Layer 1: Middleware (Optimistic Cookie Check)          │
 * │ - Fast routing decisions                                │
 * │ - No database calls                                     │
 * │ - Redirects unauthenticated users from protected routes │
 * └─────────────────────────────────────────────────────────┘
 *                          ↓
 * ┌─────────────────────────────────────────────────────────┐
 * │ Layer 2: Page/Layout (getServerSession)                │
 * │ - Validates session against database                    │
 * │ - Renders UI based on actual auth state                │
 * │ - Checks roles for conditional rendering               │
 * └─────────────────────────────────────────────────────────┘
 *                          ↓
 * ┌─────────────────────────────────────────────────────────┐
 * │ Layer 3: ORPC Procedures (THIS FILE)                   │
 * │ - Final security enforcement                            │
 * │ - Database session validation                           │
 * │ - Role-based authorization                              │
 * │ - Resource-level permissions                            │
 * └─────────────────────────────────────────────────────────┘
 *
 * Procedure Types:
 * - publicProcedure: No authentication (public data only)
 * - protectedProcedure: Valid session required (validates via getServerSession)
 * - adminProcedure: Valid session + admin role (add when needed)
 *
 * Why validate here even though middleware checks cookies?
 * 1. Middleware doesn't hit database (performance)
 * 2. Session could be expired/revoked since cookie check
 * 3. Need actual user data for authorization logic
 * 4. Defense in depth - never trust client/middleware alone
 */

export const userRouter = {
  /**
   * Get current authenticated user's full profile
   * Protected: Requires valid session
   *
   * Security: protectedProcedure validates session via getServerSession()
   * even though middleware already checked for session cookie
   */
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

  /**
   * Update current user's profile
   * Protected: User can only modify their own data
   *
   * Authorization: Uses session.user.id to ensure users can't update others
   */
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

  /**
   * Delete current user's account
   * Protected: Self-service account deletion
   *
   * Note: Consider adding additional verification (password confirmation)
   * before allowing account deletion in production
   */
  deleteAccount: protectedProcedure
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      // TODO: Add cascade deletion for related data (sessions, uploads, etc.)
      await context.db.delete(user).where(eq(user.id, userId));

      return { success: true };
    }),

  /**
   * Get public user profile by ID
   * Public: No authentication required
   *
   * Security: Only returns public fields (id, name, image)
   * Sensitive data (email, role, etc.) is excluded
   */
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

  /**
   * List all users with pagination
   * Public: Anyone can view user directory
   *
   * Privacy consideration: Depending on your app, you may want to:
   * - Make this protectedProcedure (require sign-in to see users)
   * - Make this adminProcedure (only admins see full user list)
   * - Add privacy settings to user schema (allow users to opt out)
   */
  list: publicProcedure
    .input(ListUsersInputSchema)
    .output(
      z.object({
        users: z.array(PublicUserSchema),
        total: z.number(),
      }),
    )
    .handler(async ({ input, context }) => {
      // Select only public fields
      const usersQuery = context.db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
        })
        .from(user);

      // Apply search filter if provided
      const users = input.search
        ? await usersQuery
            .where(ilike(user.name, `%${input.search}%`))
            .limit(input.limit)
            .offset(input.offset)
        : await usersQuery.limit(input.limit).offset(input.offset);

      // Get total count for pagination
      const countQuery = context.db.select({ value: count() }).from(user);
      const [result] = input.search
        ? await countQuery.where(ilike(user.name, `%${input.search}%`))
        : await countQuery;

      return {
        users,
        total: result?.value ?? 0,
      };
    }),

  /**
   * Search users by name
   * Protected: Only authenticated users can search
   *
   * This prevents anonymous users from scraping your user database
   * while still allowing legitimate users to find each other
   */
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
