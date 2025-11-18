// lib/firebaseClient.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let _app: FirebaseApp | null = null;

const clean = (v?: string) => (v ?? "").replace(/^"+|"+$/g, "").trim();

function getConfig() {
  // ⬇️ static (literal) reads so Next inlines them at build time
  const apiKey             = clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const authDomain         = clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  const projectId          = clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const storageBucket      = clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const messagingSenderId  = clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
  const appId              = clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
  const measurementId      = clean(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);

  if (!apiKey) throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!authDomain) throw new Error("Missing NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!projectId) throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!appId) throw new Error("Missing NEXT_PUBLIC_FIREBASE_APP_ID");

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    ...(measurementId ? { measurementId } : {}),
  };
}

export function getClientApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("getClientApp must be called in the browser");
  }
  if (_app) return _app;
  _app = getApps()[0] ?? initializeApp(getConfig());
  return _app;
}

export function getClientAuth(): Auth {
  return getAuth(getClientApp());
}

export function getClientDb(): Firestore {
  return getFirestore(getClientApp());
}
