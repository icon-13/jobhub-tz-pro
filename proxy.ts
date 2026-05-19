import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // Allow public access to admin login page
  if (url.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect all other /admin/* routes
  if (url.pathname.startsWith("/admin")) {
    // ✅ Await the cookie value (async in Next.js 16)
    const adminAuth = request.cookies.get("admin_auth")?.value;

    if (adminAuth !== process.env.ADMIN_SECRET) {
      // Redirect to login page
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}