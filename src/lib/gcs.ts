import "server-only";

import { Storage } from "@google-cloud/storage";

const BUCKET_NAME = process.env.GCS_BUCKET_NAME;

// Same Application Default Credentials story as firebase-admin.ts: no JSON key
// on Cloud Run, uses the attached service account.
const storage = new Storage();

function getBucket() {
  if (!BUCKET_NAME) {
    throw new Error("GCS_BUCKET_NAME env var is not set");
  }
  return storage.bucket(BUCKET_NAME);
}

const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  ".glb": "model/gltf-binary",
  ".usdz": "model/vnd.usdz+zip",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export function contentTypeForExtension(extension: string): string | undefined {
  return ALLOWED_CONTENT_TYPES[extension.toLowerCase()];
}

const MODEL_CACHE_CONTROL = "public, max-age=31536000, immutable";

/**
 * Signed PUT URL so the browser uploads directly to GCS, bypassing the app
 * server for large .glb files. `objectPath` should already be namespaced
 * per restaurant/dish (see the /api/admin/uploads/sign route).
 */
export async function getSignedUploadUrl(objectPath: string, contentType: string) {
  const [url] = await getBucket().file(objectPath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 10 * 60 * 1000,
    contentType,
    extensionHeaders: {
      "x-goog-content-length-range": "0,52428800", // 50MB ceiling for AR assets/images
    },
  });
  return url;
}

/**
 * Runs after the browser's PUT completes: makes the object publicly readable
 * (the bucket has fine-grained ACLs, not uniform access, so this is a
 * per-object grant — nothing else in the bucket becomes public) and sets
 * Cache-Control, since GCS objects don't get Next's next.config.ts headers()
 * (that only covers same-origin /public responses).
 */
export async function finalizeUploadedObject(objectPath: string) {
  const file = getBucket().file(objectPath);
  await file.makePublic();
  await file.setMetadata({ cacheControl: MODEL_CACHE_CONTROL });
}

export function publicObjectUrl(objectPath: string): string {
  return `https://storage.googleapis.com/${BUCKET_NAME}/${objectPath}`;
}
