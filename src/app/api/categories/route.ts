import { createClient } from "@supabase/supabase-js";

import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function GET() {
  const { data: categories, error: categoriesSelectionError } = await supabase
    .from("categories")
    .select()
    .is("parent", null)
    .order("name", { ascending: true });

  if (categoriesSelectionError) {
    console.error("Failed To Select Categories:", categoriesSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ categories: categories }, { status: 200 });
}
