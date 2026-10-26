import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const { data: product, error: productSelectionError } = await supabase
    .from("products")
    .select(
      "*, images:product_images(*), specifications:product_specifications(*), options:product_options(*), reviews:product_reviews(*)",
    )
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (productSelectionError) {
    console.error("Failed To Select Product:", productSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const net = product.price * (1 - product.discount / 100);

  const reviews = [...product.reviews].sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
  );

  const rating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce(
            (sum: number, review: any) => sum + review.rating,
            0,
          ) /
            reviews.length) *
            2,
        ) / 2
      : 0;

  const enrichedProduct = {
    ...product,
    net: net,
    reviews: reviews,
    rating: rating,
  };

  return NextResponse.json({ product: enrichedProduct }, { status: 200 });
}
