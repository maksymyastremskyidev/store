import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const status = body.status;

  const tracking = body.tracking?.replace(/\s+/g, "") || null;

  if (!status) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({
      status: status,
      tracking: tracking,
      updated: new Date().toISOString(),
    })
    .eq("id", id);

  if (orderUpdateError) {
    console.error("Failed To Update Order:", orderUpdateError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
