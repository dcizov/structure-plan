/**
 * Safely validates and returns a callback URL
 * Prevents open redirect vulnerabilities
 */
export function getSafeCallbackUrl(url: string | null | undefined): string {
  if (!url) return "/";

  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  return "/";
}
