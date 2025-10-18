import { userRouter } from "@/server/api/routers/user";

export const appRouter = {
  user: userRouter,
};

export type AppRouter = typeof appRouter;
