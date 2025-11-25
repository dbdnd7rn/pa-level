// app/landlord-create-listing/page.tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebaseClient";
import { useAuth } from "../_components/AuthProvider";
import RequireAuth from "../_components/RequireAuth";
import RoleGate from "../_components/RoleGate";
import { uploadToCloudinary } from "@/lib/cloudinary";

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
  coordX?: number | null; // X coordinate (e.g. longitude)
  coordY?: number | null; // Y coordinate (e.g. latitude)
  coordZ?: number | null; // Z coordinate (e.g. elevation)
};

export default function CreateListingPage() {
  return (
    <RequireAuth>
      <RoleGate allowedRole="landlord">
        <CreateListingInner />
      </RoleGate>
    </RequireAuth>
  );
}

function CreateListingInner() {
  const { user } = useAuth();
  const db = getClientDb();

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
    coordX: undefined,
    coordY: undefined,
    coordZ: undefined,
  });

  const [files, setFiles] = useState<File[]>([]);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    // De-dupe by name/size
    const byKey = new Map<string, File>();
    [...files, ...selected].forEach((f) => byKey.set(`${f.name}-${f.size}`, f));

    // Optional: filter to images only (extra safety)
    const onlyImages = Array.from(byKey.values()).filter((f) => f.type.startsWith("image/"));

    setFiles(onlyImages.slice(0, 12)); // max 12 images
  }

  function removeImage(i: number) {
    setFiles((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setError(null);

    try {
      if (!user) throw new Error("You must be logged in.");

      // 1) Create an initial Firestore doc
      const base = {
        ...draft,
        monthlyFrom: typeof draft.monthlyFrom === "number" ? draft.monthlyFrom : null,
        totalRooms: typeof draft.totalRooms === "number" ? draft.totalRooms : null,
        availableFrom: draft.availableFrom || null,
        roomTypes: draft.roomTypes || [],
        coordX: typeof draft.coordX === "number" ? draft.coordX : null,
        coordY: typeof draft.coordY === "number" ? draft.coordY : null,
        coordZ: typeof draft.coordZ === "number" ? draft.coordZ : null,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        imageUrls: [] as string[],
      };

      const listingRef = await addDoc(collection(db, "listings"), base);
      const listingId = listingRef.id;

      // 2) Upload images to Cloudinary (folder helps you keep things tidy)
      let urls: string[] = [];
      if (files.length > 0) {
        const uploads = files.map(async (file) => {
          const url = await uploadToCloudinary(file, `pa-level/listings/${listingId}`);
          return url;
        });
        urls = await Promise.all(uploads);
      }

      // 3) Patch Firestore with the image URLs
      await setDoc(
        doc(db, "listings", listingId),
        { imageUrls: urls, updatedAt: serverTimestamp() },
        { merge: true }
      );

      setStatus("Listing created 🎉");
      setFiles([]);
      setDraft({
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
        coordX: undefined,
        coordY: undefined,
        coordZ: undefined,
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#0e2756]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0e2756]">pa</span>
          <span className="text-[#ff0f64]">level</span>
        </Link>
        <nav className="text-sm">
          <Link href="/landlord-dashboard" className="font-semibold">
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <h1 className="text-2xl font-extrabold">Create a new listing</h1>
        <p className="mt-1 text-sm text-[#5f6b85]">
          Add the property details and upload up to 12 photos. You can edit this later.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Basic fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="font-semibold">Title</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Skylight Student Residence"
                required
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Property type</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.propertyType}
                onChange={(e) => setDraft((d) => ({ ...d, propertyType: e.target.value }))}
                placeholder="Student residence / House / Lodge"
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
                    monthlyFrom: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="80000"
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
                placeholder="32"
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Distance to campus</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.distanceToCampus ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, distanceToCampus: e.target.value }))
                }
                placeholder="< 1km (walking)"
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
                placeholder="Modern residence with shared kitchens, common rooms and 24/7 security."
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Area</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.area ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value }))}
                placeholder="Ndata"
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Campus</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.campus ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, campus: e.target.value }))}
                placeholder="MUST"
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold">City</span>
              <input
                className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 outline-none focus:border-[#ff0f64]"
                value={draft.city ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                placeholder="Thyolo"
              />
            </label>
          </div>

          {/* Coordinates */}
          <div className="rounded-2xl border border-[#edf0fb] p-4">
            <h3 className="text-sm font-extrabold">Location coordinates (optional)</h3>
            <p className="mt-1 text-xs text-[#5f6b85]">
              Enter X, Y, Z coordinates if you have them. For example, X = longitude, Y = latitude,
              Z = elevation.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="block text-sm">
                <span className="font-semibold">X coordinate</span>
                <input
                  type="number"
                  className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                  value={draft.coordX ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      coordX: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. 35.12345"
                />
              </label>

              <label className="block text-sm">
                <span className="font-semibold">Y coordinate</span>
                <input
                  type="number"
                  className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                  value={draft.coordY ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      coordY: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. -16.15023"
                />
              </label>

              <label className="block text-sm">
                <span className="font-semibold">Z coordinate (elevation)</span>
                <input
                  type="number"
                  className="mt-2 w-full rounded-xl border border-[#d9deef] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                  value={draft.coordZ ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      coordZ: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. 1200 (meters)"
                />
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-2xl border border-[#edf0fb] p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-extrabold">Photos</h3>
              <p className="text-xs text-[#5f6b85]">Up to 12 images</p>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onPickFiles}
              className="mt-3 block w-full text-xs"
            />

            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} className="h-32 w-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#0e2756] px-5 py-2 text-sm font-semibold text-white"
            >
              {submitting ? "Creating…" : "Create listing"}
            </button>
            {status && <p className="text-xs text-green-600">{status}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        </form>
      </main>
    </div>
  );
}
