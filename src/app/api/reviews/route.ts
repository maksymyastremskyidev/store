import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

import { jwtVerify } from "jose";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const { payload } = await jwtVerify(token, secret);

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const product = body.product;

  const rating = Number(body.rating);

  const comment = body.comment?.trim() || null;

  if (!product || isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { error: reviewInsertionError } = await supabase
    .from("product_reviews")
    .insert({
      product: product,
      user: payload.id,
      name: payload.name,
      rating: rating,
      comment: comment,
    });

  if (reviewInsertionError) {
    console.error("Failed To Insert Review:", reviewInsertionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
