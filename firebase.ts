// firebase.ts (shim so old imports keep working)
// Re-export the new *functions* under the old names.

import {
  getClientApp,
  getClientAuth,
  getClientDb,
  getClientStorage,
} from "./lib/firebaseClient";

// Keep names compatible with old code, but note: these are FUNCTIONS now.
// Usage: const auth = firebaseAuth(); const db = db(); etc.
export const firebaseApp = getClientApp;
export const firebaseAuth = getClientAuth;
export const db = getClientDb;
export const storage = getClientStorage;
