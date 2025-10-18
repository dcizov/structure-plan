import Image from "next/image";

import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] place-items-center">
      <div className="container px-4 md:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />

          <ol className="list-inside list-decimal font-mono text-sm/6">
            <li className="mb-2 tracking-[-.01em]">
              Get started by editing{" "}
              <code className="rounded bg-black/[.05] px-1 py-0.5 font-mono font-semibold dark:bg-white/[.06]">
                src/app/(public)/page.tsx
              </code>
              .
            </li>
            <li className="tracking-[-.01em]">
              Save and see your changes instantly.
            </li>
          </ol>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button
              asChild
              className="bg-foreground text-background flex h-10 items-center justify-center gap-2 rounded-full border border-transparent px-4 text-sm font-medium transition-colors hover:bg-[#383838] sm:h-12 sm:w-auto sm:px-5 sm:text-base dark:hover:bg-[#ccc]"
            >
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="dark:invert"
                  src="/vercel.svg"
                  alt="Vercel logomark"
                  width={20}
                  height={20}
                />
                Deploy now
              </a>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="flex h-10 w-full items-center justify-center rounded-full border border-black/[.08] px-4 text-sm font-medium transition-colors hover:border-transparent hover:bg-[#f2f2f2] sm:h-12 sm:w-auto sm:px-5 sm:text-base md:w-[158px] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read our docs
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
