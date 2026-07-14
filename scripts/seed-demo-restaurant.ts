/**
 * One-time (but re-runnable) migration: seeds the hardcoded DISHES from
 * src/lib/menu-data.ts as the first real tenant, restaurants/demo, so the
 * multi-tenant path (Firestore + /r/[slug]) is provable end-to-end with
 * known-good data before any real restaurant signs up. Dev tooling only —
 * not part of the Next.js app bundle.
 *
 * Usage:
 *   npx tsx scripts/seed-demo-restaurant.ts <ownerUid>
 *
 * <ownerUid> makes the seeded restaurant show up under that account's
 * /admin dashboard. Find a UID in the Firebase Console → Authentication tab,
 * or sign up once at /admin/signup and copy it from there. Uses set({merge:
 * true}) throughout, so re-running is safe and just re-syncs the data.
 */
import { existsSync, readFileSync } from "node:fs";

import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { CATEGORY_IDS, DISHES } from "../src/lib/menu-data";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const ownerUid = process.argv[2] ?? process.env.SEED_OWNER_UID;
  if (!ownerUid) {
    console.error(
      "Falta el UID del dueño.\n\n" +
        "Uso: npx tsx scripts/seed-demo-restaurant.ts <ownerUid>\n\n" +
        "Encuéntralo en Firebase Console → Authentication, o crea una cuenta\n" +
        "en /admin/signup y cópialo de ahí.",
    );
    process.exit(1);
  }

  const app = getApps()[0] ?? initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  const db = getFirestore(app);

  const restaurantId = "demo";
  const categories = CATEGORY_IDS.map((id) => ({ id, label: id }));
  const restaurantRef = db.collection("restaurants").doc(restaurantId);

  await restaurantRef.set(
    { name: "GastroAR Demo", slug: restaurantId, ownerUid, categories, createdAt: Date.now() },
    { merge: true },
  );
  console.log(`restaurants/${restaurantId} listo (owner: ${ownerUid})`);

  const dishesCol = restaurantRef.collection("dishes");
  for (const { id, ...dish } of DISHES) {
    await dishesCol.doc(id).set(dish, { merge: true });
    console.log(`  + ${id}`);
  }

  console.log(`\nListo. Visita /r/${restaurantId} (npm run dev, o tras desplegar).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
