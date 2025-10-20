/**
 * Application routes
 */
export const ROUTES = {
  HOME: "/",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Protected routes
  DASHBOARD: "/dashboard",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  DASHBOARD_PROFILE: "/dashboard/profile",

  // Admin routes
  ADMIN: "/dashboard/admin",
  ADMIN_USERS: "/dashboard/admin/users",
  ADMIN_SETTINGS: "/dashboard/admin/settings",
} as const;

/**
 * Routes only accessible to unauthenticated users
 */
export const GUEST_ONLY_ROUTES = [
  ROUTES.SIGNIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
] as const;

/**
 * Routes requiring authentication
 */
export const PROTECTED_ROUTES = [ROUTES.DASHBOARD] as const;

/**
 * Admin-only routes
 */
export const ADMIN_ROUTES = [ROUTES.ADMIN] as const;

/**
 * Public routes that skip auth checks
 */
export const NO_AUTH_ROUTES = [ROUTES.HOME] as const;
