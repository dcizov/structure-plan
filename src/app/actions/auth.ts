"use server";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/schemas/auth";

import { authClient } from "@/server/auth/client";

// Separate the error type for reusability
type ActionErrors = {
  email?: string[];
  password?: string[];
  name?: string[];
  confirmPassword?: string[];
};

// Action state type for useActionState - now allows null
export type ActionState = {
  success: boolean;
  message?: string;
  errors?: ActionErrors;
  timestamp?: number;
} | null;

/**
 * Login server action
 */
export async function loginAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    // Extract and validate form data
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validatedData = loginSchema.safeParse(rawData);

    if (!validatedData.success) {
      const errors: ActionErrors = {};
      validatedData.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          const key = path as keyof ActionErrors;
          errors[key] ??= [];
          errors[key]?.push(issue.message);
        }
      });

      return {
        success: false,
        message: "Please correct the errors below",
        errors,
        timestamp: Date.now(),
      };
    }

    // Attempt authentication
    const { data, error } = await authClient.signIn.email({
      email: validatedData.data.email,
      password: validatedData.data.password,
    });

    if (error) {
      const errorMessage = getAuthErrorMessage(error);

      return {
        success: false,
        message: errorMessage,
        errors: {
          password: [errorMessage],
        },
        timestamp: Date.now(),
      };
    }

    if (!data) {
      return {
        success: false,
        message: "Authentication failed. Please try again.",
        timestamp: Date.now(),
      };
    }

    return {
      success: true,
      message: "Successfully signed in!",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("[Login Action Error]", error);

    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      timestamp: Date.now(),
    };
  }
}

/**
 * Register server action
 */
export async function registerAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validatedData = registerSchema.safeParse(rawData);

    if (!validatedData.success) {
      const errors: ActionErrors = {};
      validatedData.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          const key = path as keyof ActionErrors;
          errors[key] ??= [];
          errors[key]?.push(issue.message);
        }
      });

      return {
        success: false,
        message: "Please correct the errors below",
        errors,
        timestamp: Date.now(),
      };
    }

    // Create user
    const { data, error } = await authClient.signUp.email({
      name: validatedData.data.name,
      email: validatedData.data.email,
      password: validatedData.data.password,
    });

    if (error) {
      return {
        success: false,
        message: error.message ?? "Failed to create account",
        errors: {
          email: [error.message ?? "Failed to create account"],
        },
        timestamp: Date.now(),
      };
    }

    if (!data) {
      return {
        success: false,
        message: "Failed to create account. Please try again.",
        timestamp: Date.now(),
      };
    }

    return {
      success: true,
      message: "Account created! Please check your email to verify.",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("[Register Action Error]", error);

    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      timestamp: Date.now(),
    };
  }
}

/**
 * Forgot password server action
 */
export async function forgotPasswordAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rawData = {
      email: formData.get("email"),
    };

    const validatedData = forgotPasswordSchema.safeParse(rawData);

    if (!validatedData.success) {
      const errors: ActionErrors = {};
      validatedData.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          const key = path as keyof ActionErrors;
          errors[key] ??= [];
          errors[key]?.push(issue.message);
        }
      });

      return {
        success: false,
        message: "Please correct the errors below",
        errors,
        timestamp: Date.now(),
      };
    }

    const { error } = await authClient.forgetPassword({
      email: validatedData.data.email,
      redirectTo: "/reset-password",
    });

    if (error) {
      return {
        success: false,
        message: error.message ?? "Failed to send reset email",
        timestamp: Date.now(),
      };
    }

    return {
      success: true,
      message: "Password reset link sent! Check your email.",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("[Forgot Password Action Error]", error);

    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      timestamp: Date.now(),
    };
  }
}

/**
 * Reset password server action
 */
export async function resetPasswordAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rawData = {
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      token: formData.get("token"),
    };

    if (!rawData.token || typeof rawData.token !== "string") {
      return {
        success: false,
        message: "Invalid reset token",
        timestamp: Date.now(),
      };
    }

    const validatedData = resetPasswordSchema.safeParse({
      password: rawData.password,
      confirmPassword: rawData.confirmPassword,
    });

    if (!validatedData.success) {
      const errors: ActionErrors = {};
      validatedData.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          const key = path as keyof ActionErrors;
          errors[key] ??= [];
          errors[key]?.push(issue.message);
        }
      });

      return {
        success: false,
        message: "Please correct the errors below",
        errors,
        timestamp: Date.now(),
      };
    }

    const { error } = await authClient.resetPassword({
      newPassword: validatedData.data.password,
      token: rawData.token,
    });

    if (error) {
      return {
        success: false,
        message: error.message ?? "Failed to reset password",
        timestamp: Date.now(),
      };
    }

    return {
      success: true,
      message: "Password reset successful!",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("[Reset Password Action Error]", error);

    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      timestamp: Date.now(),
    };
  }
}

// Helper functions
function getAuthErrorMessage(error: {
  code?: string;
  message?: string;
}): string {
  const errorMessages: Record<string, string> = {
    INVALID_CREDENTIALS: "Invalid email or password",
    USER_NOT_FOUND: "No account found with this email",
    ACCOUNT_LOCKED: "Your account has been locked. Please contact support.",
    TOO_MANY_ATTEMPTS: "Too many login attempts. Please try again later.",
    EMAIL_NOT_VERIFIED: "Please verify your email before signing in.",
  };

  if (error.code && error.code in errorMessages) {
    return errorMessages[error.code] ?? "Authentication failed";
  }

  return error.message ?? "Authentication failed";
}
