// lib/cloudinary.ts
export async function uploadToCloudinary(file: File, folder?: string): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET!;
  if (!cloud || !preset) throw new Error("Cloudinary env vars missing.");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);
  if (folder) form.append("folder", folder); // e.g. "pa-level/listings"

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Upload failed");
  return data.secure_url as string; // CDN URL
}
