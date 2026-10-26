import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const today = new Date();

  const from =
    searchParams.get("from") ||
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

  const to =
    searchParams.get("to") ||
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const months =
    (new Date(to).getFullYear() - new Date(from).getFullYear()) * 12 +
    (new Date(to).getMonth() - new Date(from).getMonth());

  const { data: orders, error: ordersSelectionError } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .gte("created", `${from}T00:00:00`)
    .lte("created", `${to}T23:59:59`)
    .order("created", { ascending: true });

  if (ordersSelectionError) {
    console.error("Failed To Select Orders:", ordersSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const { data: completedOrders, error: completedOrdersSelectionError } =
    await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("status", "Completed")
      .gte("created", `${from}T00:00:00`)
      .lte("created", `${to}T23:59:59`)
      .order("created", { ascending: true });

  if (completedOrdersSelectionError) {
    console.error(
      "Failed To Select Completed Orders:",
      completedOrdersSelectionError,
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const { data: products, error: productsSelectionError } = await supabase
    .from("products")
    .select();

  if (productsSelectionError) {
    console.error("Failed To Select Products:", productsSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const { data: categories, error: categoriesSelectionError } = await supabase
    .from("categories")
    .select("*, products(*)");

  if (categoriesSelectionError) {
    console.error("Failed To Select Categories:", categoriesSelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const revenueData: Record<string, number> = {};

  const orderCounts: Record<string, number> = {};

  const statusCounts: Record<string, number> = {};

  const carrierCounts: Record<string, number> = {};

  const deliveryCounts: Record<string, number> = {};

  const paymentCounts: Record<string, number> = {};

  function getPeriod(date: string) {
    if (months > 12) {
      return date.slice(0, 4);
    }

    if (months > 1) {
      return date.slice(0, 7);
    }

    return date.slice(0, 10);
  }

  for (const order of completedOrders) {
    const period = getPeriod(order.created);

    revenueData[period] = Number(
      ((revenueData[period] || 0) + order.total).toFixed(2),
    );
  }

  for (const order of orders) {
    const period = getPeriod(order.created);

    orderCounts[period] = (orderCounts[period] || 0) + 1;

    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;

    carrierCounts[order.carrier] = (carrierCounts[order.carrier] || 0) + 1;

    deliveryCounts[order.delivery] = (deliveryCounts[order.delivery] || 0) + 1;

    paymentCounts[order.payment] = (paymentCounts[order.payment] || 0) + 1;
  }

  function areaChart(data: Record<string, number>) {
    return Object.entries(data).map(([label, value]) => ({ label, value }));
  }

  function barChart(data: Record<string, number>) {
    return Object.entries(data)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }

  const revenueChart = areaChart(revenueData);

  const ordersChart = areaChart(orderCounts);

  const statusesChart = barChart(statusCounts);

  const carriersChart = barChart(carrierCounts);

  const deliveriesChart = barChart(deliveryCounts);

  const paymentsChart = barChart(paymentCounts);

  function countSales(orders: any[]) {
    const sales: Record<string, number> = {};

    for (const order of orders) {
      for (const item of order.items) {
        if (!item.product) {
          continue;
        }

        if (!sales[item.product]) {
          sales[item.product] = 0;
        }

        sales[item.product] += item.quantity;
      }
    }

    return sales;
  }

  const sales = countSales(completedOrders);

  const bestProducts = products
    .map((product) => ({ label: product.name, value: sales[product.id] || 0 }))
    .filter((product) => product.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const bestCategories = categories
    .map((category) => ({
      label: category.name,
      value: category.products.reduce(
        (sum: number, product: any) => sum + (sales[product.id] || 0),
        0,
      ),
    }))
    .filter((category) => category.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return NextResponse.json(
    {
      revenue: revenueChart,
      orders: ordersChart,
      statuses: statusesChart,
      carriers: carriersChart,
      deliveries: deliveriesChart,
      payments: paymentsChart,
      products: bestProducts,
      categories: bestCategories,
    },
    { status: 200 },
  );
}
