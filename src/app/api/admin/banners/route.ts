import { createClient } from "@supabase/supabase-js";

import { NextResponse, NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function GET(request: NextRequest) {
  const sort = request.nextUrl.searchParams.get("sort") || "created-new-old";

  const { data: banners, error: bannersSelectionError } = await supabase
    .from("banners")
    .select();

  if (bannersSelectionError) {
    console.error("Failed To Select Banners:", bannersSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  function sortBanners(banners: any[], sort: string | null) {
    switch (sort) {
      case "created-new-old":
        return [...banners].sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime(),
        );

      case "created-old-new":
        return [...banners].sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime(),
        );

      case "updated-new-old":
        return [...banners].sort(
          (a, b) =>
            new Date(b.updated).getTime() - new Date(a.updated).getTime(),
        );

      case "updated-old-new":
        return [...banners].sort(
          (a, b) =>
            new Date(a.updated).getTime() - new Date(b.updated).getTime(),
        );

      default:
        return banners;
    }
  }

  const sortedBanners = sortBanners(banners, sort);

  return NextResponse.json({ banners: sortedBanners }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const image = body.image?.replace(/\s+/g, "");

  if (!image) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { error: bannerInsertionError } = await supabase
    .from("banners")
    .insert({ image: image });

  if (bannerInsertionError) {
    console.error("Failed To Insert Banner:", bannerInsertionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
