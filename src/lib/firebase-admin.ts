import "server-only";

import { type App, cert, getApps, initializeApp } from "firebase-admin/app";
import { type Auth, getAuth } from "firebase-admin/auth";
import { type Firestore, getFirestore } from "firebase-admin/firestore";

/**
 * On Cloud Run, Application Default Credentials come from the attached service
 * account — no JSON key is shipped. Locally, `gcloud auth application-default
 * login` (or GOOGLE_APPLICATION_CREDENTIALS) provides the same thing, so
 * `initializeApp()` with no explicit credential works in both environments.
 */
function getFirebaseAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    return initializeApp({ credential: cert(JSON.parse(serviceAccountKey)) });
  }

  return initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

const app = getFirebaseAdminApp();

export const adminAuth: Auth = getAuth(app);
export const adminDb: Firestore = getFirestore(app);
