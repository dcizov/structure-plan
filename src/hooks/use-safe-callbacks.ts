"use client";

import { useSearchParams } from "next/navigation";

import { getSafeCallbackUrl } from "@/lib/url";

/**
 * Hook to safely get callback URL from search params
 * @returns Safe callback URL (defaults to "/")
 */
export function useSafeCallback(): string {
  const searchParams = useSearchParams();
  const callbackUrl: string | null = searchParams.get("callbackUrl");
  const safeUrl: string = getSafeCallbackUrl(callbackUrl);
  return safeUrl;
}
