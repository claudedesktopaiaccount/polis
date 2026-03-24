import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const res = NextResponse.redirect(new URL("/admin-login", origin));
  res.cookies.delete("admin_session");
  return res;
}
