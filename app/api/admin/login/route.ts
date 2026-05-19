import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password === process.env.ADMIN_SECRET) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_auth", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}