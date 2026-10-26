import { createClient } from "@supabase/supabase-js";

import { NextResponse, NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function GET(request: NextRequest) {
  const filters: Record<string, string[]> = {};

  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (key === "query" || key === "sort") {
      continue;
    }

    if (!filters[key]) {
      filters[key] = [];
    }

    filters[key].push(value);
  }

  const query = request.nextUrl.searchParams.get("query")?.trim() || "";

  const sort = request.nextUrl.searchParams.get("sort") || "created-new-old";

  const { data: coupons, error: couponsSelectionError } = query
    ? await supabase.from("coupons").select().ilike("code", `%${query}%`)
    : await supabase.from("coupons").select();

  if (couponsSelectionError) {
    console.error("Failed To Select Coupons:", couponsSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  function generateFilters() {
    const filters: Record<
      string,
      {
        label: string;
        slug: string;
        values: Record<string, { label: string; slug: string }>;
      }
    > = {
      active: {
        label: "Active",
        slug: "active",
        values: {
          yes: { label: "Yes", slug: "yes" },
          no: { label: "No", slug: "no" },
        },
      },

      available: {
        label: "Available",
        slug: "available",
        values: {
          yes: { label: "Yes", slug: "yes" },
          no: { label: "No", slug: "no" },
        },
      },
    };

    return Object.values(filters).map((filter) => ({
      label: filter.label,
      slug: filter.slug,
      values: Object.values(filter.values),
    }));
  }

  function filterCoupons(coupons: any[], filters: Record<string, string[]>) {
    return coupons.filter((coupon) => {
      return Object.entries(filters).every(([filter, values]) => {
        return values.some((value) => {
          switch (filter) {
            case "active":
              switch (value) {
                case "yes":
                  return new Date(coupon.expires).getTime() >= Date.now();

                case "no":
                  return new Date(coupon.expires).getTime() < Date.now();

                default:
                  return false;
              }

            case "available":
              switch (value) {
                case "yes":
                  return coupon.used < coupon.limit;

                case "no":
                  return coupon.used >= coupon.limit;

                default:
                  return false;
              }

            default:
              return false;
          }
        });
      });
    });
  }

  function sortCoupons(coupons: any[], sort: string | null) {
    switch (sort) {
      case "created-new-old":
        return [...coupons].sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime(),
        );

      case "created-old-new":
        return [...coupons].sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime(),
        );

      case "updated-new-old":
        return [...coupons].sort(
          (a, b) =>
            new Date(b.updated).getTime() - new Date(a.updated).getTime(),
        );

      case "updated-old-new":
        return [...coupons].sort(
          (a, b) =>
            new Date(a.updated).getTime() - new Date(b.updated).getTime(),
        );

      case "expires-first-last":
        return [...coupons].sort(
          (a, b) =>
            new Date(a.expires).getTime() - new Date(b.expires).getTime(),
        );

      case "expires-last-first":
        return [...coupons].sort(
          (a, b) =>
            new Date(b.expires).getTime() - new Date(a.expires).getTime(),
        );

      case "code-a-z":
        return [...coupons].sort((a, b) => a.code.localeCompare(b.code));

      case "code-z-a":
        return [...coupons].sort((a, b) => b.code.localeCompare(a.code));

      case "discount-low-high":
        return [...coupons].sort((a, b) => a.discount - b.discount);

      case "discount-high-low":
        return [...coupons].sort((a, b) => b.discount - a.discount);

      case "used-low-high":
        return [...coupons].sort((a, b) => a.used - b.used);

      case "used-high-low":
        return [...coupons].sort((a, b) => b.used - a.used);

      case "limit-low-high":
        return [...coupons].sort((a, b) => a.limit - b.limit);

      case "limit-high-low":
        return [...coupons].sort((a, b) => b.limit - a.limit);

      default:
        return coupons;
    }
  }

  const filteredCoupons = filterCoupons(coupons, filters);

  const sortedCoupons = sortCoupons(filteredCoupons, sort);

  const generatedFilters = generateFilters();

  return NextResponse.json(
    {
      coupons: sortedCoupons,
      filters: generatedFilters,
    },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
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

  const { error: couponInsertionError } = await supabase
    .from("coupons")
    .insert({
      code: code,
      discount: discount,
      limit: limit,
      expires: expires
        ? new Date(expires).toISOString()
        : new Date().toISOString(),
    });

  if (couponInsertionError) {
    console.error("Failed To Insert Coupon:", couponInsertionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
