// src/app/(public)/layout.tsx
import Navbar from "@/app/(public)/_components/navbar/navbar";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar /> {/* ✅ No session prop - fetches its own data */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
