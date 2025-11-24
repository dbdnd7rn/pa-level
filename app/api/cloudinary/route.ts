// app/api/cloudinary/destroy/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { ok: false, error: "Missing publicId" },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error("Cloudinary destroy error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Destroy failed" },
      { status: 500 }
    );
  }
}
