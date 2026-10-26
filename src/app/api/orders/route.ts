import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

import { cookies } from "next/headers";

import { jwtVerify } from "jose";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const name = body.name?.trim();

  const email = body.email?.replace(/\s+/g, "").toLowerCase();

  const phone = body.phone?.replace(/\s+/g, "");

  const country = body.country?.trim();

  const city = body.city?.trim();

  const address = body.address?.trim();

  const postal = body.postal?.replace(/\s+/g, "");

  const carrier = body.carrier;

  const delivery = body.delivery;

  const payment = body.payment;

  const code = body.code?.replace(/\s+/g, "").toUpperCase() || null;

  const cart = body.cart;

  if (
    !name ||
    !email ||
    !phone ||
    !country ||
    !city ||
    !address ||
    !postal ||
    !carrier ||
    !delivery ||
    !payment ||
    !Array.isArray(cart) ||
    cart.length === 0
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  for (const item of cart) {
    if (!item.id || !item.quantity) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }
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

  const items: any[] = [];

  for (const item of cart) {
    const option = map.get(item.id);

    if (!option?.product?.active) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const net = Number(
      (option.product.price * (1 - option.product.discount / 100)).toFixed(2),
    );

    const quantity = Math.floor(Number(item.quantity));

    if (isNaN(quantity) || quantity < 1 || quantity > option.stock) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    items.push({
      ...option.product,
      ...option,
      options: option.product.options.length,
      net: net,
      quantity: quantity,
    });
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { data: coupon, error: couponSelectionError } = code
    ? await supabase.from("coupons").select().eq("code", code).maybeSingle()
    : { data: null, error: null };

  if (couponSelectionError) {
    console.error("Failed To Select Coupon:", couponSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  if (
    code &&
    (!coupon ||
      coupon.used >= coupon.limit ||
      new Date(coupon.expires) <= new Date())
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  function generateOrderNumber() {
    const now = new Date();

    return (
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0")
    );
  }

  const token = (await cookies()).get("token")?.value;

  const user = token
    ? (await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)))
        .payload.id
    : null;

  const discount = coupon ? coupon.discount : 0;

  const subtotal = Number(
    items.reduce((sum, item) => sum + item.net * item.quantity, 0).toFixed(2),
  );

  const total = Number((subtotal * (1 - discount / 100)).toFixed(2));

  const currency = items[0]?.currency;

  const { data: order, error: orderInsertionError } = await supabase
    .from("orders")
    .insert({
      number: generateOrderNumber(),
      user: user,
      name: name,
      email: email,
      phone: phone,
      country: country,
      city: city,
      address: address,
      postal: postal,
      carrier: carrier,
      delivery: delivery,
      payment: payment,
      code: code,
      discount: discount,
      subtotal: subtotal,
      total: total,
      currency: currency,
      status: "Pending",
    })
    .select()
    .single();

  if (orderInsertionError) {
    console.error("Failed To Insert Order:", orderInsertionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  async function deleteOrder() {
    const { error: orderDeletionError } = await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    if (orderDeletionError) {
      console.error("Failed To Delete Order:", orderDeletionError);

      return false;
    }

    return true;
  }

  async function restoreStock() {
    for (const item of items) {
      const option = map.get(item.id);

      if (!option?.product?.active) {
        continue;
      }

      const { error: stockUpdateError } = await supabase
        .from("product_options")
        .update({ stock: option.stock })
        .eq("id", option.id);

      if (stockUpdateError) {
        console.error("Failed To Update Stock:", stockUpdateError);

        return false;
      }
    }

    return true;
  }

  const { error: itemsInsertionError } = await supabase
    .from("order_items")
    .insert(
      items.map((item) => ({
        order: order.id,
        product: item.product.id,
        image: item.images.find((image: any) => image.position === 1).url,
        name: item.name,
        options: item.options,
        attribute: item.attribute,
        value: item.value,
        sku: item.sku,
        price: item.price,
        discount: item.discount,
        net: item.net,
        currency: item.currency,
        quantity: item.quantity,
      })),
    );

  if (itemsInsertionError) {
    await deleteOrder();

    console.error("Failed To Insert Items:", itemsInsertionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  for (const item of items) {
    const option = map.get(item.id);

    const stock = option.stock - item.quantity;

    const { error: stockUpdateError } = await supabase
      .from("product_options")
      .update({ stock: stock })
      .eq("id", option.id);

    if (stockUpdateError) {
      await deleteOrder();

      await restoreStock();

      console.error("Failed To Update Stock:", stockUpdateError);

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }

  if (coupon) {
    const used = coupon.used + 1;

    const { error: couponUpdateError } = await supabase
      .from("coupons")
      .update({ used: used })
      .eq("id", coupon.id);

    if (couponUpdateError) {
      await deleteOrder();

      await restoreStock();

      console.error("Failed To Update Coupon:", couponUpdateError);

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
