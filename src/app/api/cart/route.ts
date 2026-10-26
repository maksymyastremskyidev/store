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

  const cart = body.cart;

  if (!Array.isArray(cart)) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const ids = cart.map((item) => item.id);

  const { data: options, error: optionsSelectionError } = await supabase
    .from("product_options")
    .select(
      "*, product:products(*, images:product_images(*), options:product_options(*))",
    )
    .in("id", ids);

  if (optionsSelectionError) {
    console.error("Failed To Select Options:", optionsSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const map = new Map(options.map((option) => [option.id, option]));

  const items = cart
    .map((item) => {
      const option = map.get(item.id);

      if (!option?.product?.active) {
        return null;
      }

      const net = Number(
        (option.product.price * (1 - option.product.discount / 100)).toFixed(2),
      );

      const quantity = Math.min(
        Math.max(Math.floor(Number(item.quantity)), 1),
        option.stock,
      );

      return {
        ...option.product,
        ...option,
        net: net,
        quantity: quantity,
      };
    })
    .filter((item) => item !== null);

  const total = Number(
    items.reduce((sum, item) => sum + item.net * item.quantity, 0).toFixed(2),
  );

  const currency = items[0]?.currency;

  return NextResponse.json(
    { cart: items, total: total, currency: currency },
    { status: 200 },
  );
}
