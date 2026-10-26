import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

import slugify from "slugify";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function GET(request: NextRequest) {
  const filters: Record<string, string[]> = {};

  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (key === "query" || key === "sort" || key === "page") {
      continue;
    }

    if (!filters[key]) {
      filters[key] = [];
    }

    filters[key].push(value);
  }

  const query = request.nextUrl.searchParams.get("query")?.trim() || "";

  const sort = request.nextUrl.searchParams.get("sort") || "created-new-old";

  const page = Math.floor(
    Number(request.nextUrl.searchParams.get("page")) || 1,
  );

  const limit = 20;

  const { data: orders, error: ordersSelectionError } = query
    ? await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .or(
          `number.ilike.%${query}%,tracking.ilike.%${query}%,name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,country.ilike.%${query}%,city.ilike.%${query}%,address.ilike.%${query}%,postal.ilike.%${query}%`,
        )
    : await supabase.from("orders").select("*, items:order_items(*)");

  if (ordersSelectionError) {
    console.error("Failed To Select Orders:", ordersSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  function generateFilters(orders: any[]) {
    const filters: Record<
      string,
      {
        label: string;
        slug: string;
        values: Record<string, { label: string; slug: string }>;
      }
    > = {
      status: {
        label: "Status",
        slug: "status",
        values: {
          pending: { label: "Pending", slug: "pending" },
          processing: { label: "Processing", slug: "processing" },
          shipped: { label: "Shipped", slug: "shipped" },
          delivered: { label: "Delivered", slug: "delivered" },
          completed: { label: "Completed", slug: "completed" },
          cancelled: { label: "Cancelled", slug: "cancelled" },
          returned: { label: "Returned", slug: "returned" },
          refunded: { label: "Refunded", slug: "refunded" },
        },
      },

      carrier: { label: "Carrier", slug: "carrier", values: {} },

      delivery: { label: "Delivery", slug: "delivery", values: {} },

      payment: { label: "Payment", slug: "payment", values: {} },
    };

    for (const order of orders) {
      if (order.carrier) {
        const value = slugify(order.carrier, {
          lower: true,
          strict: true,
        });

        filters.carrier.values[value] = {
          label: order.carrier,
          slug: value,
        };
      }

      if (order.delivery) {
        const value = slugify(order.delivery, {
          lower: true,
          strict: true,
        });

        filters.delivery.values[value] = {
          label: order.delivery,
          slug: value,
        };
      }

      if (order.payment) {
        const value = slugify(order.payment, {
          lower: true,
          strict: true,
        });

        filters.payment.values[value] = {
          label: order.payment,
          slug: value,
        };
      }
    }

    return Object.values(filters).map((filter) => ({
      label: filter.label,
      slug: filter.slug,
      values:
        filter.slug === "status"
          ? Object.values(filter.values)
          : Object.values(filter.values).sort((a, b) =>
              a.label.localeCompare(b.label),
            ),
    }));
  }

  function filterOrders(orders: any[], filters: Record<string, string[]>) {
    return orders.filter((order) => {
      return Object.entries(filters).every(([filter, values]) => {
        return values.some((value) => {
          switch (filter) {
            case "status":
              return (
                value === slugify(order.status, { lower: true, strict: true })
              );

            case "carrier":
              return (
                value === slugify(order.carrier, { lower: true, strict: true })
              );

            case "delivery":
              return (
                value === slugify(order.delivery, { lower: true, strict: true })
              );

            case "payment":
              return (
                value === slugify(order.payment, { lower: true, strict: true })
              );

            default:
              return false;
          }
        });
      });
    });
  }

  function sortOrders(orders: any[], sort: string | null) {
    switch (sort) {
      case "created-new-old":
        return [...orders].sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime(),
        );

      case "created-old-new":
        return [...orders].sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime(),
        );

      case "updated-new-old":
        return [...orders].sort(
          (a, b) =>
            new Date(b.updated).getTime() - new Date(a.updated).getTime(),
        );

      case "updated-old-new":
        return [...orders].sort(
          (a, b) =>
            new Date(a.updated).getTime() - new Date(b.updated).getTime(),
        );

      case "quantity-low-high":
        return [...orders].sort((a, b) => a.quantity - b.quantity);

      case "quantity-high-low":
        return [...orders].sort((a, b) => b.quantity - a.quantity);

      case "total-low-high":
        return [...orders].sort((a, b) => a.total - b.total);

      case "total-high-low":
        return [...orders].sort((a, b) => b.total - a.total);

      default:
        return orders;
    }
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

  const filteredOrders = filterOrders(enrichedOrders, filters);

  const sortedOrders = sortOrders(filteredOrders, sort);

  const totalOrders = sortedOrders.length;

  const totalPages = Math.max(Math.ceil(totalOrders / limit), 1);

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const start = (currentPage - 1) * limit;

  const end = currentPage * limit;

  const paginatedOrders = sortedOrders.slice(start, end);

  const generatedFilters = generateFilters(orders);

  return NextResponse.json(
    {
      orders: paginatedOrders,
      filters: generatedFilters,
      totalPages: totalPages,
      currentPage: currentPage,
    },
    { status: 200 },
  );
}
