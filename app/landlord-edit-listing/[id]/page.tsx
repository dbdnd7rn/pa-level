"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  deleteDoc,
  DocumentData,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebaseClient";
import RequireAuth from "@/app/_components/RequireAuth";
import RoleGate from "@/app/_components/RoleGate";
import { useAuth } from "@/app/_components/AuthProvider";

// ---------- Types ----------

type Draft = {
  title: string;
  propertyType: string;
  monthlyFrom?: number | null;
  totalRooms?: number | null;
  distanceToCampus?: string;
  availableFrom?: string | null; // YYYY-MM
  description?: string;
  roomTypes: string[];
  area?: string;
  campus?: string;
  city?: string;
};

type EditableImage = {
  url: string;
  publicId?: string; // only if from Cloudinary
};

// ---------- Fallback / helpers ----------

const defaultHeroImages = [
  "https://images.pexels.com/photos/8136916/pexels-photo-8136916.jpeg",
  "https://images.pexels.com/photos/2611877/pexels-photo-2611877.jpeg",
  "https://images.pexels.com/photos/4392270/pexels-photo-4392270.jpeg",
  "https://images.pexels.com/photos/6585763/pexels-photo-6585763.jpeg",
];

// Try to extract Cloudinary public_id from a URL.
function extractCloudinaryPublicId(
  url: string | undefined | null
): string | undefined {
  if (!url) return undefined;
  if (!url.includes("res.cloudinary.com")) return undefined;
  const parts = url.split("/upload/");
  if (parts.length < 2) return undefined;
  const afterUpload = parts[1];
  const withoutQuery = afterUpload.split("?")[0];
  const noExt = withoutQuery.replace(/\.[a-zA-Z0-9]+$/, "");
  return noExt || undefined;
}

// Cloudinary unsigned upload helper
async function uploadToCloudinary(
  file: File
): Promise<{ secureUrl: string; publicId: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error("Cloudinary env vars missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Cloudinary upload failed:", text);
    throw new Error("Cloudinary upload failed");
  }

  const json = await res.json();
  return {
    secureUrl: json.secure_url as string,
    publicId: json.public_id as string,
  };
}

// ---------- Page wrapper (fixes params Promise issue) ----------

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const listingIdRaw = params?.id;
  const listingId =
    typeof listingIdRaw === "string"
      ? listingIdRaw
      : Array.isArray(listingIdRaw)
      ? listingIdRaw[0]
      : "";

  if (!listingId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-red-600">
          Missing listing id in URL. Please go back to your dashboard.
        </p>
      </div>
    );
  }

  return (
    <RequireAuth>
      <RoleGate allowedRole="landlord">
        <EditListingInner listingId={listingId} />
      </RoleGate>
    </RequireAuth>
  );
}

// ---------- Main edit component ----------

function EditListingInner({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const db = getClientDb();
  const router = useRouter();

  const [draft, setDraft] = useState<Draft>({
    title: "",
    propertyType: "Student residence",
    monthlyFrom: undefined,
    totalRooms: undefined,
    distanceToCampus: "",
    availableFrom: "",
    description: "",
    roomTypes: [],
    area: "",
    campus: "",
    city: "",
  });

  // existing images from Firestore (or sample)
  const [images, setImages] = useState<EditableImage[]>([]);
  // new local files to upload
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // previews for new files
  const newPreviews = useMemo(
    () => newFiles.map((f) => URL.createObjectURL(f)),
    [newFiles]
  );

  // ---------- Load listing from Firestore ----------

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!listingId) return;
      setLoading(true);
      setError(null);
      setStatus(null);

      try {
        const ref = doc(db, "listings", listingId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          if (!isMounted) return;
          setError("Listing not found. It may have been deleted.");
          setImages([]);
          setDraft((d) => ({
            ...d,
            title: "",
          }));
          return;
        }

        const data = snap.data() as DocumentData;

        let monthlyFrom: number | null = null;
        if (typeof data.monthlyFrom === "number") monthlyFrom = data.monthlyFrom;
        else if (typeof data.monthlyFrom === "string") {
          const digits = data.monthlyFrom.replace(/[^\d]/g, "");
          monthlyFrom = digits ? parseInt(digits, 10) : null;
        } else if (typeof data.priceFrom === "number") {
          monthlyFrom = data.priceFrom;
        }

        const totalRooms =
          typeof data.totalRooms === "number" ? data.totalRooms : null;

        const imageUrls: string[] =
          Array.isArray(data.imageUrls) && data.imageUrls.length > 0
            ? data.imageUrls
            : defaultHeroImages;

        if (!isMounted) return;

        setDraft({
          title: data.title ?? "",
          propertyType: data.propertyType ?? "Student residence",
          monthlyFrom,
          totalRooms,
          distanceToCampus: data.distanceToCampus ?? "",
          availableFrom: data.availableFrom ?? "",
          description: data.description ?? "",
          roomTypes: Array.isArray(data.roomTypes) ? data.roomTypes : [],
          area: data.area ?? "",
          campus: data.campus ?? "",
          city: data.city ?? "",
        });

        setImages(
          imageUrls.map((url) => ({
            url,
            publicId: extractCloudinaryPublicId(url),
          }))
        );
        setRemovedPublicIds([]);
        setNewFiles([]);
      } catch (e: any) {
        console.error("Failed to load listing:", e);
        if (!isMounted) return;
        setError(e?.message || "Failed to load listing");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [db, listingId]);

  // ---------- Handlers ----------

  function onPickNewFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    setNewFiles((prev) => {
      const combined = [...prev, ...selected];

      const alreadyCount = images.length;
      const allowedForNew = Math.max(0, 12 - alreadyCount);
      return combined.slice(0, allowedForNew);
    });

    e.target.value = "";
  }

  function removeExistingImage(idx: number) {
    setImages((arr) => {
      const copy = [...arr];
      const removed = copy[idx];
      if (removed?.publicId) {
        setRemovedPublicIds((prev) => [...prev, removed.publicId!]);
      }
      copy.splice(idx, 1);
      return copy;
    });
  }

  function removeNewImage(idx: number) {
    setNewFiles((arr) => arr.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in.");
      return;
    }
    if (!listingId) {
      setError("Missing listing id.");
      return;
    }

    setSaving(true);
    setStatus(null);
    setError(null);

    try {
      // 1) Upload new files to Cloudinary
      let uploadedUrls: string[] = [];
      let uploadedPublicIds: string[] = [];

      if (newFiles.length > 0) {
        const uploads = await Promise.all(
          newFiles.map((file) => uploadToCloudinary(file))
        );
        uploadedUrls = uploads.map((u) => u.secureUrl);
        uploadedPublicIds = uploads.map((u) => u.publicId);
      }

      // 2) Final image URLs
      const remainingExistingUrls = images.map((img) => img.url);
      const finalImageUrls = [...remainingExistingUrls, ...uploadedUrls];

      // 3) Save to Firestore
      const ref = doc(db, "listings", listingId);

      await setDoc(
        ref,
        {
          ...draft,
          monthlyFrom:
            typeof draft.monthlyFrom === "number" ? draft.monthlyFrom : null,
          totalRooms:
            typeof draft.totalRooms === "number" ? draft.totalRooms : null,
          availableFrom: draft.availableFrom || null,
          roomTypes: draft.roomTypes || [],
          updatedAt: serverTimestamp(),
          imageUrls: finalImageUrls,
        },
        { merge: true }
      );

      // 4) Delete removed images from Cloudinary (optional)
      if (removedPublicIds.length > 0) {
        await Promise.allSettled(
          removedPublicIds.map((pid) =>
            fetch("/api/cloudinary/destroy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ publicId: pid }),
            })
          )
        );
      }

      // 5) Update local state
      setImages([
        ...remainingExistingUrls.map((url) => ({
          url,
          publicId: extractCloudinaryPublicId(url),
        })),
        ...uploadedUrls.map((url, i) => ({
          url,
          publicId: uploadedPublicIds[i],
        })),
      ]);
      setNewFiles([]);
      setRemovedPublicIds([]);
      setStatus("Changes saved ✅");
    } catch (e: any) {
      console.error("Save failed:", e);
      setError(e?.message || "Failed to save listing.");
    } finally {
      setSaving(false);
    }
  }

  // 🔴 Delete listing entirely
  async function handleDeleteListing() {
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    const ok = window.confirm(
      "Are you sure you want to delete this listing? This cannot be undone."
    );
    if (!ok) return;

    setDeleting(true);
    setError(null);
    setStatus(null);

    try {
      // 1) Delete Firestore doc
      const ref = doc(db, "listings", listingId);
      await deleteDoc(ref);

      // 2) Try to delete all Cloudinary images (best effort)
      const publicIdsFromImages = images
        .map((img) => img.publicId)
        .filter((pid): pid is string => !!pid);

      const allPublicIds = Array.from(
        new Set([...publicIdsFromImages, ...removedPublicIds])
      );

      if (allPublicIds.length > 0) {
        await Promise.allSettled(
          allPublicIds.map((pid) =>
            fetch("/api/cloudinary/destroy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ publicId: pid }),
            })
          )
        );
      }

      // 3) Redirect back to dashboard
      router.push("/landlord-dashboard");
    } catch (e: any) {
      console.error("Delete listing failed:", e);
      setError(e?.message || "Failed to delete listing.");
    } finally {
      setDeleting(false);
    }
  }

  // ---------- UI ----------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-[#0e2756]">
        Loading listing…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0e2756]">
      {/* TOP NAV */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0e2756]">pa</span>
          <span className="text-[#ff0f64]">level</span>
        </Link>
        <nav className="text-sm">
          <Link
            href="/landlord-dashboard"
            className="font-semibold text-[#0e2756]"
          >
            ← Back to dashboard
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <h1 className="text-2xl font-extrabold">Edit listing</h1>
        <p className="mt-1 text-sm text-[#5f6b85]">
          Update the property details and manage the photos for this listing.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Basic fields (same layout as create) */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="font-semibold">Title</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
                required
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Property type</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.propertyType}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, propertyType: e.target.value }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Monthly price (from)</span>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.monthlyFrom ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    monthlyFrom: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Total rooms</span>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.totalRooms ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    totalRooms: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Distance to campus</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.distanceToCampus ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    distanceToCampus: e.target.value,
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Available from (YYYY-MM)</span>
              <input
                type="month"
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.availableFrom ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, availableFrom: e.target.value }))
                }
              />
            </label>

            <label className="block text-sm md:col-span-2">
              <span className="font-semibold">Description</span>
              <textarea
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                rows={4}
                value={draft.description ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Area</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.area ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, area: e.target.value }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Campus</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.campus ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, campus: e.target.value }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">City</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.city ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, city: e.target.value }))
                }
              />
            </label>
          </div>

          {/* Photos */}
          <div className="rounded-2xl border border-[#edf0fb] p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-extrabold">Photos</h3>
              <p className="text-xs text-[#5f6b85]">
                Up to 12 images total (existing + new)
              </p>
            </div>

            {/* Existing images */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img, idx) => (
                  <div
                    key={`${img.url}-${idx}`}
                    className="relative overflow-hidden rounded-2xl"
                  >
                    <img
                      src={img.url}
                      alt={`Listing photo ${idx + 1}`}
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New photos input & previews */}
            <div className="mt-4 text-xs">
              <p className="font-semibold">Add new photos</p>
              <p className="mt-1 text-[11px] text-[#5f6b85]">
                Browse… {newFiles.length} file(s) selected.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPickNewFiles}
                className="mt-2 block w-full text-xs"
              />

              {newPreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {newPreviews.map((src, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative overflow-hidden rounded-2xl"
                    >
                      <img
                        src={src}
                        alt={`New upload ${idx + 1}`}
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status + Delete row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving || deleting}
                className="rounded-full bg-[#0e2756] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              {status && <p className="text-xs text-green-600">{status}</p>}
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <button
              type="button"
              onClick={handleDeleteListing}
              disabled={deleting || saving}
              className="self-start rounded-full border border-red-500 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete listing"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
