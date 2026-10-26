import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() || "";

  const { data: products, error: productsSelectionError } = await supabase
    .from("products")
    .select()
    .ilike("name", `%${query}%`)
    .eq("active", true)
    .limit(10);

  if (productsSelectionError) {
    console.error("Failed To Select Products:", productsSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ products: products }, { status: 200 });
}
