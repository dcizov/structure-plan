import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AuthButtons({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Button asChild variant="outline" size="sm">
        <Link href="/sgnin">Sign In</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );
}
