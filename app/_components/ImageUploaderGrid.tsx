"use client";

import {
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { getClientStorage } from "@/lib/firebaseClient";

type ImageUploaderGridProps = {
  /** e.g. `listings/<listingId>` */
  storagePathPrefix: string;
  /** Existing download URLs to seed the grid */
  initialUrls?: string[];
  /** Fired whenever the URL list changes (order, add, remove) */
  onChange: (urls: string[]) => void;
  /** Max images allowed */
  max?: number;
  /** If true (default), removing an image also deletes it from Storage */
  deleteFromStorage?: boolean;
};

type Item = {
  url: string | null; // becomes non-null when upload finishes
  file?: File; // local file while uploading
  progress?: number; // 0..100 for upload
  uploading?: boolean;
};

export default function ImageUploaderGrid({
  storagePathPrefix,
  initialUrls = [],
  onChange,
  max = 12,
  deleteFromStorage = true,
}: ImageUploaderGridProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [isDragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  // seed items from existing urls
  useEffect(() => {
    setItems(initialUrls.map((u) => ({ url: u, uploading: false, progress: 100 })));
  }, [initialUrls]);

  // bubble URLs upstream whenever list changes
  useEffect(() => {
    onChange(items.map((x) => x.url).filter(Boolean) as string[]);
  }, [items, onChange]);

  const canAdd = useMemo(() => items.length < max, [items.length, max]);

  const pickFiles = () => inputRef.current?.click();

  const pushPlaceholder = (file?: File) => {
    setItems((prev) => [
      ...prev,
      { url: null, file, uploading: !!file, progress: file ? 0 : undefined },
    ]);
    return items.length; // return index new item will occupy (previous length)
  };

  const uploadFile = (file: File, placeholderIndex: number) => {
    const storage = getClientStorage();
    const path = `${storagePathPrefix}/${
      Date.now() + "-" + Math.random().toString(36).slice(2)
    }-${file.name}`;

    const task = uploadBytesResumable(ref(storage, path), file);

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setItems((prev) => {
          const next = [...prev];
          if (next[placeholderIndex]) next[placeholderIndex].progress = pct;
          return next;
        });
      },
      (err) => {
        console.error("Upload failed:", err);
        // remove failed placeholder
        setItems((prev) => {
          const next = [...prev];
          next.splice(placeholderIndex, 1);
          return next;
        });
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setItems((prev) => {
          const next = [...prev];
          if (next[placeholderIndex]) {
            next[placeholderIndex] = { url, uploading: false, progress: 100 };
          }
          return next;
        });
      }
    );
  };

  const handleFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files);
    for (const file of arr) {
      if (!canAdd) break;
      const idx = pushPlaceholder(file);
      uploadFile(file, idx);
    }
    // reset input so same file can be added again
    if (inputRef.current) inputRef.current.value = "";
  };

  /** Remove item and (optionally) delete the blob in Storage */
  const removeAt = async (idx: number) => {
    const item = items[idx];
    setItems((prev) => prev.filter((_, i) => i !== idx));

    if (deleteFromStorage && item?.url) {
      try {
        // ref() accepts a full HTTPS Firebase Storage URL too
        const storage = getClientStorage();
        await deleteObject(ref(storage, item.url));
      } catch (e) {
        console.warn("Delete from storage failed (continuing):", e);
      }
    }
  };

  /** Move item by index */
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((prev) => {
      const next = [...prev];
      const [el] = next.splice(from, 1);
      next.splice(to, 0, el);
      return next;
    });
  };

  // --- Drag & Drop: from desktop onto grid
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length) handleFiles(files);
  };

  // --- Reorder by dragging tiles within grid
  const tileDragStart = (i: number) => setDragFrom(i);
  const tileDragOver = (e: DragEvent, overIndex: number) => {
    e.preventDefault();
    if (dragFrom == null || dragFrom === overIndex) return;
    // live reorder on hover
    setItems((prev) => {
      const next = [...prev];
      const [el] = next.splice(dragFrom, 1);
      next.splice(overIndex, 0, el);
      return next;
    });
    setDragFrom(overIndex);
  };
  const tileDragEnd = () => setDragFrom(null);

  // Paste support (Ctrl/Cmd+V) while grid focused
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onPaste = (e: ClipboardEvent) => {
      const files: File[] = [];
      if (e.clipboardData) {
        for (const item of Array.from(e.clipboardData.items)) {
          const f = item.getAsFile();
          if (f && f.type.startsWith("image/")) files.push(f);
        }
      }
      if (files.length) handleFiles(files);
    };
    el.addEventListener("paste", onPaste as any);
    return () => el.removeEventListener("paste", onPaste as any);
  }, [handleFiles]);

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border ${
        isDragOver ? "border-[#ff0f64]" : "border-[#cfd6f6]"
      } bg-white p-3 outline-none`}
      tabIndex={0}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="mb-3 text-[11px] text-[#5f6b85]">
        Drag & drop, paste, or{" "}
        <button
          type="button"
          onClick={pickFiles}
          className="font-semibold text-[#0e2756] underline"
        >
          choose files
        </button>{" "}
        (max {max})
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((it, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => tileDragStart(idx)}
            onDragOver={(e) => tileDragOver(e, idx)}
            onDragEnd={tileDragEnd}
            className="group relative overflow-hidden rounded-2xl border border-[#e7ebfb] bg-white"
            title="Drag to reorder"
          >
            {it.url ? (
              <img
                src={it.url}
                alt={`photo ${idx + 1}`}
                className="h-36 w-full select-none object-cover"
                draggable={false}
              />
            ) : (
              <div className="flex h-36 w-full items-center justify-center text-xs text-[#5f6b85]">
                {it.uploading ? `Uploading… ${it.progress ?? 0}%` : "Pending"}
              </div>
            )}

            {/* progress ribbon */}
            {it.uploading && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
                <div
                  className="h-1 bg-[#ff0f64] transition-[width]"
                  style={{ width: `${it.progress ?? 0}%` }}
                />
              </div>
            )}

            {/* reorder + index */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-2 py-1 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => move(idx, idx - 1)}
                className="rounded px-2 text-[11px] text-white"
                title="Move left"
                type="button"
              >
                ◀
              </button>
              <span className="rounded bg-white/80 px-2 text-[10px] font-semibold text-[#0e2756]">
                {idx + 1}
              </span>
              <button
                onClick={() => move(idx, idx + 1)}
                className="rounded px-2 text-[11px] text-white"
                title="Move right"
                type="button"
              >
                ▶
              </button>
            </div>

            {/* remove */}
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#ff0f64] shadow"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={pickFiles}
            className="flex h-36 w-full items-center justify-center rounded-2xl border border-dashed border-[#cfd6f6] text-xs font-semibold text-[#0e2756]"
          >
            + Add photos
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
