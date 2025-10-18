/**
 * Application routes
 * Centralized route definitions for type safety and maintainability
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ADMIN: "/admin",
} as const;

/**
 * Routes only accessible to unauthenticated users
 * Used by middleware for route protection
 */
export const GUEST_ONLY_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
] as const;

/**
 * Admin-only routes
 * Used by middleware for role-based access control
 */
export const ADMIN_ROUTES = [ROUTES.ADMIN] as const;

/**
 * Public routes that skip auth checks (performance optimization)
 * Uncomment and add routes when needed
 */
export const NO_AUTH_ROUTES: string[] = [
  // "/about",
  // "/pricing",
  // "/blog",
];
