// lib/firebaseClient.ts
"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// remove leading/trailing spaces and zero-width chars
function clean(v?: string) {
  return (v ?? "").trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
}

const cfg = {
  apiKey: clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: clean(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
};

let app: FirebaseApp | undefined;

export function getClientApp(): FirebaseApp {
  if (!app) {
    app = getApps()[0] ?? initializeApp(cfg);
    if (process.env.NODE_ENV === "development") {
      // safe debug: only show first 6 chars of the key
      console.log("[firebase] init", {
        keyStart: cfg.apiKey?.slice(0, 6),
        authDomain: cfg.authDomain,
        projectId: cfg.projectId,
        storageBucket: cfg.storageBucket,
      });
    }
  }
  return app;
}

export function getClientAuth(): Auth {
  return getAuth(getClientApp());
}

export function getClientDb(): Firestore {
  return getFirestore(getClientApp());
}

export function getClientStorage(): FirebaseStorage {
  return getStorage(getClientApp());
}
