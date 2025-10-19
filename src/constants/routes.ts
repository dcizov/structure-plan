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

  // Protected routes (require authentication)
  DASHBOARD: "/dashboard",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  DASHBOARD_PROFILE: "/dashboard/profile",

  // Admin routes (require authentication + admin role)
  ADMIN: "/dashboard/admin",
  ADMIN_USERS: "/dashboard/admin/users",
  ADMIN_SETTINGS: "/dashboard/admin/settings",
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
 * Routes requiring authentication (but not admin)
 * Used by middleware for auth protection
 */
export const PROTECTED_ROUTES = [ROUTES.DASHBOARD] as const;

/**
 * Admin-only routes (require authentication + admin role)
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
