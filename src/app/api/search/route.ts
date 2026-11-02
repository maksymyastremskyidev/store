import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase-default";

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
