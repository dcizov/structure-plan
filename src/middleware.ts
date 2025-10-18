import { NextResponse, type NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

import { env } from "@/env";
import type { Session } from "@/server/auth";
import { getSafeCallbackUrl } from "@/lib/url";

const guestOnlyRoutes = ["/login", "/register", "/forgot-password"];

const protectedRoutes = ["/reset-password", "/verify-email"];

const adminRoutes = ["/admin"];

function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export default async function authMiddleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isGuestOnlyRoute = matchesRoute(pathname, guestOnlyRoutes);
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
  const isAdminRoute = matchesRoute(pathname, adminRoutes);

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: env.BETTER_AUTH_URL,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    },
  );

  if (!session) {
    if (isGuestOnlyRoute) {
      return NextResponse.next();
    }

    if (isProtectedRoute || isAdminRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (isGuestOnlyRoute) {
    const callbackParam = searchParams.get("callbackUrl");
    const callbackUrl = getSafeCallbackUrl(callbackParam);
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  }

  if (isAdminRoute) {
    const user = session.user as { role?: string };
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*$).*)",
  ],
};
