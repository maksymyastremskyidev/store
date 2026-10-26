import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcrypt";

import { SignJWT } from "jose";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const email = body.email?.replace(/\s+/g, "").toLowerCase();

  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { data: user, error: userSelectionError } = await supabase
    .from("users")
    .select()
    .eq("email", email)
    .maybeSingle();

  if (userSelectionError) {
    console.error("Failed To Select User:", userSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const token = await new SignJWT({ id: user.id, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
