import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = { /* your env keys */ };

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Try to enable offline persistence (ignore if it fails)
enableIndexedDbPersistence(db).catch(() => {});

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-extrabold">You’re offline</h1>
        <p className="mt-2 text-sm text-[#5f6b85]">
          No internet connection. Some pages and images may be unavailable.
        </p>
        <p className="mt-1 text-xs text-[#9ba3c4]">
          Tip: Once you visit pages online, they’ll be cached and load faster next time.
        </p>
      </div>
    </div>
  );
}
