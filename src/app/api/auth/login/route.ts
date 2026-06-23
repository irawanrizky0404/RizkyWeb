import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fac001-fallback-secret"
);

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    console.error("[auth] ADMIN_EMAIL or ADMIN_PASSWORD not set in .env.local");
    return NextResponse.json({ error: "Server misconfigured — check .env.local" }, { status: 500 });
  }

  const emailMatch = email.trim() === validEmail.trim();
  const passwordMatch = password.trim() === validPassword.trim();

  if (!emailMatch || !passwordMatch) {
    console.warn("[auth] Login failed — email match:", emailMatch, "password match:", passwordMatch);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
