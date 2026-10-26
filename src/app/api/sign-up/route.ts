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

  const name = body.name?.trim();

  const email = body.email?.replace(/\s+/g, "").toLowerCase();

  const password = body.password;

  if (
    !name ||
    !email ||
    !password ||
    password.length < 8 ||
    /\s/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^a-zA-Z0-9]/.test(password)
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { data: user, error: userInsertionError } = await supabase
    .from("users")
    .insert({
      name: name,
      email: email,
      password: await bcrypt.hash(password, 10),
    })
    .select()
    .single();

  if (userInsertionError) {
    if (userInsertionError.code === "23505") {
      return NextResponse.json({ error: "Conflict" }, { status: 409 });
    }

    console.error("Failed To Insert User:", userInsertionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const token = await new SignJWT({ id: user.id, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const response = NextResponse.json({ success: true }, { status: 201 });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
