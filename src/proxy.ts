import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

import { jwtVerify } from "jose";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export async function proxy(request: NextRequest) {
  const api = request.nextUrl.pathname.startsWith("/api");

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return api
      ? new NextResponse("Unauthorized", { status: 401 })
      : NextResponse.redirect(new URL("/", request.url));
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    const { payload } = await jwtVerify(token, secret);

    const { data: user, error: userSelectionError } = await supabase
      .from("users")
      .select("admin")
      .eq("id", payload.id)
      .maybeSingle();

    if (userSelectionError) {
      console.error("Internal Server Error:", userSelectionError);

      return api
        ? new NextResponse("Internal Server Error", { status: 500 })
        : NextResponse.redirect(new URL("/", request.url));
    }

    if (!user) {
      return api
        ? new NextResponse("Unauthorized", { status: 401 })
        : NextResponse.redirect(new URL("/", request.url));
    }

    if (!user.admin) {
      return api
        ? new NextResponse("Forbidden", { status: 403 })
        : NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    return api
      ? new NextResponse("Unauthorized", { status: 401 })
      : NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*"],
};
