import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const image = body.image?.replace(/\s+/g, "");

  if (!image) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { error: bannerUpdateError } = await supabase
    .from("banners")
    .update({
      image: image,
      updated: new Date().toISOString(),
    })
    .eq("id", id);

  if (bannerUpdateError) {
    console.error("Failed To Update Banner:", bannerUpdateError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { error: bannerDeletionError } = await supabase
    .from("banners")
    .delete()
    .eq("id", id);

  if (bannerDeletionError) {
    console.error("Failed To Delete Banner:", bannerDeletionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
