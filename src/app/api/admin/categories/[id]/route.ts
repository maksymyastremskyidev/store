import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase-secret";

import slugify from "slugify";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const parent = body.parent || null;

  const name = body.name?.trim();

  const image = body.image?.replace(/\s+/g, "");

  if (!name || !image) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { error: categoryUpdateError } = await supabase
    .from("categories")
    .update({
      parent: parent,
      name: name,
      slug: slugify(name, { lower: true, strict: true }),
      image: image,
      updated: new Date().toISOString(),
    })
    .eq("id", id);

  if (categoryUpdateError) {
    console.error("Failed To Update Category:", categoryUpdateError);

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

  const { error: categoryDeletionError } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (categoryDeletionError) {
    console.error("Failed To Delete Category:", categoryDeletionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
