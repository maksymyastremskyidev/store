import { createClient } from "@supabase/supabase-js";

import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function GET() {
  const { data: banners, error: bannersSelectionError } = await supabase
    .from("banners")
    .select()
    .order("created", { ascending: false });

  if (bannersSelectionError) {
    console.error("Failed To Select Banners:", bannersSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ banners: banners }, { status: 200 });
}
