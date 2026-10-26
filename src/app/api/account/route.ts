import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

import { jwtVerify } from "jose";

import bcrypt from "bcrypt";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const { payload } = await jwtVerify(token, secret);

  const { data: user, error: userSelectionError } = await supabase
    .from("users")
    .select("name, email, admin")
    .eq("id", payload.id)
    .single();

  if (userSelectionError) {
    console.error("Failed To Select User:", userSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const { data: orders, error: ordersSelectionError } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user", payload.id)
    .order("created", { ascending: false });

  if (ordersSelectionError) {
    console.error("Failed To Select Orders:", ordersSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const enrichedOrders = orders.map((order) => {
    const quantity = order.items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );

    return {
      ...order,
      quantity: quantity,
    };
  });

  return NextResponse.json(
    { user: user, orders: enrichedOrders },
    { status: 200 },
  );
}

export async function PATCH(request: NextRequest) {
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

  const password = body.password;

  if (
    !password ||
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^a-zA-Z0-9]/.test(password) ||
    /\s/.test(password)
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { error: userUpdateError } = await supabase
    .from("users")
    .update({ password: await bcrypt.hash(password, 10) })
    .eq("id", payload.id);

  if (userUpdateError) {
    console.error("Failed To Update User:", userUpdateError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const { payload } = await jwtVerify(token, secret);

  const { error: userDeletionError } = await supabase
    .from("users")
    .delete()
    .eq("id", payload.id);

  if (userDeletionError) {
    console.error("Failed To Delete User:", userDeletionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.delete("token");

  return response;
}
