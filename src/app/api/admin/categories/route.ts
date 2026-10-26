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

  const { data: completedOrders, error: completedOrdersSelectionError } =
    await supabase
      .from("orders")
      .select("items:order_items(*)")
      .eq("status", "Completed");

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

  function generateFilters(categories: any[]) {
    const filters: Record<
      string,
      {
        label: string;
        slug: string;
        values: Record<string, { label: string; slug: string }>;
      }
    > = {
      parent: { label: "Parent", slug: "parent", values: {} },
    };

    for (const category of categories) {
      if (category.parent) {
        continue;
      }

      const value = slugify(category.name, { lower: true, strict: true });

      filters.parent.values[value] = { label: category.name, slug: value };
    }

    return Object.values(filters).map((filter) => ({
      label: filter.label,
      slug: filter.slug,
      values: Object.values(filter.values).sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
    }));
  }

  function filterCategories(
    categories: any[],
    filters: Record<string, string[]>,
  ) {
    return categories.filter((category) => {
      return Object.entries(filters).every(([filter, values]) => {
        return values.some((value) => {
          return (
            filter === "parent" &&
            value ===
              slugify(category.name, {
                lower: true,
                strict: true,
              })
          );
        });
      });
    });
  }

  function filterTree(categories: any[], query: string): any[] {
    if (!query) {
      return categories;
    }

    const result = [];

    for (const category of categories) {
      const children = filterTree(category.children, query);

      const matches = category.name.toLowerCase().includes(query.toLowerCase());

      if (matches || children.length > 0) {
        result.push({ ...category, children });
      }
    }

    return result;
  }

  function sortCategories(categories: any[], sort: string | null) {
    switch (sort) {
      case "created-new-old":
        return [...categories].sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime(),
        );

      case "created-old-new":
        return [...categories].sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime(),
        );

      case "updated-new-old":
        return [...categories].sort(
          (a, b) =>
            new Date(b.updated).getTime() - new Date(a.updated).getTime(),
        );

      case "updated-old-new":
        return [...categories].sort(
          (a, b) =>
            new Date(a.updated).getTime() - new Date(b.updated).getTime(),
        );

      case "name-a-z":
        return [...categories].sort((a, b) => a.name.localeCompare(b.name));

      case "name-z-a":
        return [...categories].sort((a, b) => b.name.localeCompare(a.name));

      case "products-low-high":
        return [...categories].sort((a, b) => a.products - b.products);

      case "products-high-low":
        return [...categories].sort((a, b) => b.products - a.products);

      case "sold-low-high":
        return [...categories].sort((a, b) => a.sold - b.sold);

      case "sold-high-low":
        return [...categories].sort((a, b) => b.sold - a.sold);

      default:
        return categories;
    }
  }

  function sortTree(categories: any[], sort: string | null): any[] {
    return sortCategories(categories, sort).map((category) => ({
      ...category,
      children: sortTree(category.children, sort),
    }));
  }

  function aggregateTotals(categories: any[]) {
    for (const category of categories) {
      aggregateTotals(category.children);

      for (const child of category.children) {
        category.products += child.products;

        category.sold += child.sold;
      }
    }

    return categories;
  }

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

  const map = new Map();

  for (const category of categories) {
    const products = category.products.length;

    const sold = category.products.reduce(
      (sum: number, product: any) => sum + (sales[product.id] || 0),
      0,
    );

    map.set(category.id, {
      ...category,
      products: products,
      sold: sold,
      children: [],
    });
  }

  const tree = [];

  for (const category of categories) {
    const node = map.get(category.id);

    if (category.parent) {
      const parent = map.get(category.parent);

      node.parent = {
        id: parent.id,
        name: parent.name,
      };

      parent.children.push(node);
    } else {
      node.parent = null;

      tree.push(node);
    }
  }

  const aggregatedTree = aggregateTotals(tree);

  const searchedTree = filterTree(aggregatedTree, query);

  const filteredTree = filterCategories(searchedTree, filters);

  const sortedTree = sortTree(filteredTree, sort);

  const generatedFilters = generateFilters(query ? searchedTree : categories);

  return NextResponse.json(
    {
      categories: sortedTree,
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

  const parent = body.parent || null;

  const name = body.name?.trim();

  const image = body.image?.replace(/\s+/g, "");

  if (!name || !image) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { error: categoryInsertionError } = await supabase
    .from("categories")
    .insert({
      parent: parent,
      name: name,
      slug: slugify(name, { lower: true, strict: true }),
      image: image,
    });

  if (categoryInsertionError) {
    console.error("Failed To Insert Category:", categoryInsertionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
