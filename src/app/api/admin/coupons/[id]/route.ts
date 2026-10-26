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

  const code = body.code?.replace(/\s+/g, "").toUpperCase();

  const discount = Number(Number(body.discount).toFixed(0));

  const limit = Number(Number(body.limit).toFixed(0));

  const expires = body.expires;

  if (
    !code ||
    isNaN(discount) ||
    discount < 0 ||
    discount > 100 ||
    isNaN(limit) ||
    limit < 0
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { error: couponUpdateError } = await supabase
    .from("coupons")
    .update({
      code: code,
      discount: discount,
      limit: limit,
      expires: expires
        ? new Date(expires).toISOString()
        : new Date().toISOString(),
      updated: new Date().toISOString(),
    })
    .eq("id", id);

  if (couponUpdateError) {
    console.error("Failed To Update Coupon:", couponUpdateError);

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

  const { error: couponDeletionError } = await supabase
    .from("coupons")
    .delete()
    .eq("id", id);

  if (couponDeletionError) {
    console.error("Failed To Delete Coupon:", couponDeletionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
