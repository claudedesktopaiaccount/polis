import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

interface Props { children: ReactNode }

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  return !!sessionToken && sessionToken === process.env.ADMIN_SECRET;
}

export default async function AdminLayout({ children }: Props) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin-login");
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-divider">
        <span className="font-serif text-xl font-bold text-ink">Polis Admin</span>
        <a href="/admin/logout" className="text-sm text-muted hover:text-ink">Odhlásiť</a>
      </div>
      {children}
    </div>
  );
}
