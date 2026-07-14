import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { adminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/signup"];

/**
 * This project targets Next.js 16, where `middleware.ts` was renamed to
 * `proxy.ts` (see node_modules/next/dist/docs/.../proxy.md) — same
 * capabilities, defaults to the Node.js runtime, which firebase-admin needs.
 *
 * Only verifies the cookie's signature/expiry (no revocation check, so no
 * network round trip) — an optimistic first line of defense, as recommended
 * by the Next.js auth guide. Every admin API route re-verifies with
 * getSessionUser() before touching Firestore; this is not the only boundary.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await adminAuth.verifySessionCookie(cookie);
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
