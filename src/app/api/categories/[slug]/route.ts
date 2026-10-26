import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

import slugify from "slugify";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const filters: Record<string, string[]> = {};

  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (key === "sort" || key === "page") {
      continue;
    }

    if (!filters[key]) {
      filters[key] = [];
    }

    filters[key].push(value);
  }

  const sort = request.nextUrl.searchParams.get("sort") || "newest";

  const page = Math.floor(
    Number(request.nextUrl.searchParams.get("page")) || 1,
  );

  const limit = 20;

  const { data: category, error: categorySelectionError } = await supabase
    .from("categories")
    .select()
    .eq("slug", slug)
    .single();

  if (categorySelectionError) {
    console.error("Failed To Select Category:", categorySelectionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const { data: subcategories, error: subcategoriesSelectionError } =
    await supabase
      .from("categories")
      .select()
      .eq("parent", category.id)
      .order("name", { ascending: true });

  if (subcategoriesSelectionError) {
    console.error(
      "Failed To Select Subcategories:",
      subcategoriesSelectionError,
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const { data: products, error: productsSelectionError } = await supabase
    .from("products")
    .select(
      "*, images:product_images(*), specifications:product_specifications(*), reviews:product_reviews(*)",
    )
    .eq("category", category.id)
    .eq("active", true);

  if (productsSelectionError) {
    console.error("Failed To Select Products:", productsSelectionError);

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
        position: number;
        values: Record<string, { label: string; slug: string }>;
      }
    > = {};

    for (const product of products) {
      for (const specification of product.specifications) {
        const filter = slugify(specification.attribute, {
          lower: true,
          strict: true,
        });

        const value = slugify(specification.value, {
          lower: true,
          strict: true,
        });

        if (!filters[filter]) {
          filters[filter] = {
            label: specification.attribute,
            slug: filter,
            position: specification.position,
            values: {},
          };
        }

        filters[filter].position = Math.min(
          filters[filter].position,
          specification.position,
        );

        filters[filter].values[value] = {
          label: specification.value,
          slug: value,
        };
      }
    }

    return Object.values(filters)
      .sort((a, b) => a.position - b.position)
      .map((filter) => ({
        label: filter.label,
        slug: filter.slug,
        values: Object.values(filter.values).sort((a, b) =>
          a.label.localeCompare(b.label),
        ),
      }));
  }

  function filterProducts(products: any[], filters: Record<string, string[]>) {
    return products.filter((product) => {
      return Object.entries(filters).every(([filter, values]) => {
        return values.some((value) => {
          return product.specifications.some((specification: any) => {
            return (
              filter ===
                slugify(specification.attribute, {
                  lower: true,
                  strict: true,
                }) &&
              value ===
                slugify(specification.value, { lower: true, strict: true })
            );
          });
        });
      });
    });
  }

  function sortProducts(products: any[], sort: string | null) {
    switch (sort) {
      case "newest":
        return [...products].sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime(),
        );

      case "oldest":
        return [...products].sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime(),
        );

      case "name-a-z":
        return [...products].sort((a, b) => a.name.localeCompare(b.name));

      case "name-z-a":
        return [...products].sort((a, b) => b.name.localeCompare(a.name));

      case "price-low-high":
        return [...products].sort((a, b) => a.net - b.net);

      case "price-high-low":
        return [...products].sort((a, b) => b.net - a.net);

      case "discount-low-high":
        return [...products].sort((a, b) => a.discount - b.discount);

      case "discount-high-low":
        return [...products].sort((a, b) => b.discount - a.discount);

      case "rating-low-high":
        return [...products].sort((a, b) => a.rating - b.rating);

      case "rating-high-low":
        return [...products].sort((a, b) => b.rating - a.rating);

      case "reviews-low-high":
        return [...products].sort((a, b) => a.reviews - b.reviews);

      case "reviews-high-low":
        return [...products].sort((a, b) => b.reviews - a.reviews);

      default:
        return products;
    }
  }

  const enrichedProducts = products.map((product) => {
    const net = product.price * (1 - product.discount / 100);

    const reviews = product.reviews.length;

    const rating =
      reviews > 0
        ? Math.round(
            (product.reviews.reduce(
              (sum: number, review: any) => sum + review.rating,
              0,
            ) /
              reviews) *
              2,
          ) / 2
        : 0;

    return {
      ...product,
      net: net,
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

  const generatedFilters = generateFilters(products);

  return NextResponse.json(
    {
      category: category,
      subcategories: subcategories,
      products: paginatedProducts,
      filters: generatedFilters,
      totalPages: totalPages,
      currentPage: currentPage,
    },
    { status: 200 },
  );
}
