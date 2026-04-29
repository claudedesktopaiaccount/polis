import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isAdminAuthedFromCookies } from "@/lib/admin-auth";

interface Props { children: ReactNode }

export default async function AdminLayout({ children }: Props) {
  const authed = await isAdminAuthedFromCookies();
  if (!authed) redirect("/admin-login");
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-divider">
        <span className="font-serif text-xl font-bold text-ink">VolímTo Admin</span>
        <a href="/admin/logout" className="text-sm text-muted hover:text-ink">Odhlásiť</a>
      </div>
      {children}
    </div>
  );
}
