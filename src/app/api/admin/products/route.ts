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

  const { data: products, error: productsSelectionError } = query
    ? await supabase
        .from("products")
        .select(
          "*, category:categories(*), images:product_images(*), specifications:product_specifications(*), options:product_options(*), reviews:product_reviews(*)",
        )
        .ilike("name", `%${query}%`)
    : await supabase
        .from("products")
        .select(
          "*, category:categories(*), images:product_images(*), specifications:product_specifications(*), options:product_options(*), reviews:product_reviews(*)",
        );

  if (productsSelectionError) {
    console.error("Failed To Select Products:", productsSelectionError);

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

  function generateFilters(products: any[]) {
    const filters: Record<
      string,
      {
        label: string;
        slug: string;
        values: Record<string, { label: string; slug: string }>;
      }
    > = {
      category: { label: "Category", slug: "category", values: {} },

      active: {
        label: "Active",
        slug: "active",
        values: {
          yes: { label: "Yes", slug: "yes" },
          no: { label: "No", slug: "no" },
        },
      },

      available: {
        label: "Available",
        slug: "available",
        values: {
          yes: { label: "Yes", slug: "yes" },
          no: { label: "No", slug: "no" },
        },
      },

      discounted: {
        label: "Discounted",
        slug: "discounted",
        values: {
          yes: { label: "Yes", slug: "yes" },
          no: { label: "No", slug: "no" },
        },
      },
    };

    for (const product of products) {
      const value = slugify(product.category.name, {
        lower: true,
        strict: true,
      });

      filters.category.values[value] = {
        label: product.category.name,
        slug: value,
      };
    }

    return Object.values(filters).map((filter) => ({
      label: filter.label,
      slug: filter.slug,
      values:
        filter.slug === "category"
          ? Object.values(filter.values).sort((a, b) =>
              a.label.localeCompare(b.label),
            )
          : Object.values(filter.values),
    }));
  }

  function filterProducts(products: any[], filters: Record<string, string[]>) {
    return products.filter((product) => {
      return Object.entries(filters).every(([filter, values]) => {
        return values.some((value) => {
          switch (filter) {
            case "category":
              return (
                value ===
                slugify(product.category.name, { lower: true, strict: true })
              );

            case "active":
              switch (value) {
                case "yes":
                  return product.active;

                case "no":
                  return !product.active;

                default:
                  return false;
              }

            case "available":
              switch (value) {
                case "yes":
                  return product.options.some(
                    (option: any) => option.stock > 0,
                  );

                case "no":
                  return product.options.some(
                    (option: any) => option.stock === 0,
                  );

                default:
                  return false;
              }

            case "discounted":
              switch (value) {
                case "yes":
                  return product.discount > 0;

                case "no":
                  return product.discount === 0;

                default:
                  return false;
              }

            default:
              return false;
          }
        });
      });
    });
  }

  function sortProducts(products: any[], sort: string | null) {
    switch (sort) {
      case "created-new-old":
        return [...products].sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime(),
        );

      case "created-old-new":
        return [...products].sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime(),
        );

      case "updated-new-old":
        return [...products].sort(
          (a, b) =>
            new Date(b.updated).getTime() - new Date(a.updated).getTime(),
        );

      case "updated-old-new":
        return [...products].sort(
          (a, b) =>
            new Date(a.updated).getTime() - new Date(b.updated).getTime(),
        );

      case "name-a-z":
        return [...products].sort((a, b) => a.name.localeCompare(b.name));

      case "name-z-a":
        return [...products].sort((a, b) => b.name.localeCompare(a.name));

      case "category-a-z":
        return [...products].sort((a, b) =>
          a.category.name.localeCompare(b.category.name),
        );

      case "category-z-a":
        return [...products].sort((a, b) =>
          b.category.name.localeCompare(a.category.name),
        );

      case "price-low-high":
        return [...products].sort((a, b) => a.net - b.net);

      case "price-high-low":
        return [...products].sort((a, b) => b.net - a.net);

      case "discount-low-high":
        return [...products].sort((a, b) => a.discount - b.discount);

      case "discount-high-low":
        return [...products].sort((a, b) => b.discount - a.discount);

      case "sold-low-high":
        return [...products].sort((a, b) => a.sold - b.sold);

      case "sold-high-low":
        return [...products].sort((a, b) => b.sold - a.sold);

      case "rating-low-high":
        return [...products].sort((a, b) => a.rating - b.rating);

      case "rating-high-low":
        return [...products].sort((a, b) => b.rating - a.rating);

      case "reviews-low-high":
        return [...products].sort(
          (a, b) => a.reviews.length - b.reviews.length,
        );

      case "reviews-high-low":
        return [...products].sort(
          (a, b) => b.reviews.length - a.reviews.length,
        );

      default:
        return products;
    }
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

  const enrichedProducts = products.map((product) => {
    const category = { id: product.category.id, name: product.category.name };

    const net = product.price * (1 - product.discount / 100);

    const sold = sales[product.id] || 0;

    const reviews = [...product.reviews].sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
    );

    const rating =
      reviews.length > 0
        ? Math.round(
            (reviews.reduce(
              (sum: number, review: any) => sum + review.rating,
              0,
            ) /
              reviews.length) *
              2,
          ) / 2
        : 0;

    return {
      ...product,
      category: category,
      net: net,
      sold: sold,
      reviews: reviews,
      rating: rating,
    };
  });

  const filteredProducts = filterProducts(enrichedProducts, filters);

  const sortedProducts = sortProducts(filteredProducts, sort);

  const totalProducts = sortedProducts.length;

  const totalPages = Math.max(Math.ceil(totalProducts / limit), 1);

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const start = (currentPage - 1) * limit;

  const end = currentPage * limit;

  const paginatedProducts = sortedProducts.slice(start, end);

  const ids = sortedProducts.map((product) => product.id);

  const generatedFilters = generateFilters(products);

  return NextResponse.json(
    {
      products: paginatedProducts,
      ids: ids,
      filters: generatedFilters,
      totalPages: totalPages,
      currentPage: currentPage,
    },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const category = body.category;

  const name = body.name?.trim();

  const price = Number(Number(body.price).toFixed(2));

  const discount = Number(Number(body.discount).toFixed(0));

  const currency = body.currency?.replace(/\s+/g, "").toUpperCase();

  const description = body.description?.trim();

  const images = Array.isArray(body.images)
    ? body.images.map((image: any) => ({
        ...image,
        url: image.url?.replace(/\s+/g, ""),
      }))
    : [];

  const specifications = Array.isArray(body.specifications)
    ? body.specifications.map((specification: any) => ({
        ...specification,
        attribute: specification.attribute?.trim(),
        value: specification.value?.trim(),
      }))
    : [];

  const options = Array.isArray(body.options)
    ? body.options.map((option: any) => ({
        ...option,
        attribute: option.attribute?.trim(),
        value: option.value?.trim(),
        sku: option.sku?.replace(/\s+/g, "").toUpperCase(),
        stock: Number(Number(option.stock).toFixed(0)),
      }))
    : [];

  const active = Boolean(body.active);

  if (
    !category ||
    !name ||
    isNaN(price) ||
    price < 0 ||
    isNaN(discount) ||
    discount < 0 ||
    discount > 100 ||
    !currency ||
    !description ||
    images.length === 0 ||
    images.some((image: any) => !image.url) ||
    specifications.length === 0 ||
    specifications.some(
      (specification: any) => !specification.attribute || !specification.value,
    ) ||
    options.length === 0 ||
    options.some(
      (option: any) =>
        !option.attribute ||
        !option.value ||
        !option.sku ||
        isNaN(option.stock) ||
        option.stock < 0,
    )
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { data: product, error: productInsertionError } = await supabase
    .from("products")
    .insert({
      category: category,
      name: name,
      slug: slugify(name, { lower: true, strict: true }),
      price: price,
      discount: discount,
      currency: currency,
      description: description,
      active: active,
    })
    .select()
    .single();

  if (productInsertionError) {
    console.error("Failed To Insert Product:", productInsertionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Failed To Delete Product:", error);

      return false;
    }

    return true;
  }

  const { error: imagesInsertionError } = await supabase
    .from("product_images")
    .insert(
      images.map((image: any, index: any) => ({
        product: product.id,
        url: image.url,
        position: index + 1,
      })),
    );

  if (imagesInsertionError) {
    await deleteProduct(product.id);

    console.error("Failed To Insert Images:", imagesInsertionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const { error: specificationsInsertionError } = await supabase
    .from("product_specifications")
    .insert(
      specifications.map((specification: any, index: any) => ({
        product: product.id,
        attribute: specification.attribute,
        value: specification.value,
        position: index + 1,
      })),
    );

  if (specificationsInsertionError) {
    await deleteProduct(product.id);

    console.error(
      "Failed To Insert Specifications:",
      specificationsInsertionError,
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const { error: optionsInsertionError } = await supabase
    .from("product_options")
    .insert(
      options.map((option: any, index: any) => ({
        product: product.id,
        attribute: option.attribute,
        value: option.value,
        sku: option.sku,
        stock: option.stock,
        position: index + 1,
      })),
    );

  if (optionsInsertionError) {
    await deleteProduct(product.id);

    console.error("Failed To Insert Options:", optionsInsertionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const ids = body.ids;

  const discount = Number(Number(body.discount).toFixed(0));

  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    isNaN(discount) ||
    discount < 0 ||
    discount > 100
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { error: productsUpdateError } = await supabase
    .from("products")
    .update({ discount: discount, updated: new Date().toISOString() })
    .in("id", ids);

  if (productsUpdateError) {
    console.error("Failed To Update Products:", productsUpdateError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
