import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const code = body.code?.replace(/\s+/g, "").toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { data: coupon, error: couponSelectionError } = await supabase
    .from("coupons")
    .select()
    .eq("code", code)
    .maybeSingle();

  if (couponSelectionError) {
    console.error("Failed To Select Coupon:", couponSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  if (
    !coupon ||
    coupon.used >= coupon.limit ||
    new Date(coupon.expires) <= new Date()
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const discount = coupon.discount;

  return NextResponse.json({ discount: discount }, { status: 200 });
}
