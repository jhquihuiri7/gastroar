import "server-only";

import { cookies } from "next/headers";

import { adminAuth } from "./firebase-admin";

export const SESSION_COOKIE_NAME = "session";

// Firebase caps session cookies at 14 days.
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export interface SessionUser {
  uid: string;
  email: string | null;
}

/**
 * Full verification (signature + expiry) against Firebase Auth. Every admin
 * API route calls this itself — see the note in Phase 3 of the plan: proxy.ts
 * is an optimistic first line of defense, not the only authorization boundary.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(cookie);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}

export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}
