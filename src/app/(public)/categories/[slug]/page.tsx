"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";

import { useState, useEffect } from "react";

import Link from "next/link";

import {
  Loader,
  Funnel,
  X,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Page() {
  const { slug } = useParams();

  const searchParams = useSearchParams();

  const [pendingParams, setPendingParams] = useState(
    new URLSearchParams(searchParams),
  );

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [products, setProducts] = useState<any[]>([]);

  const [filters, setFilters] = useState<any[]>([]);

  const [totalPages, setTotalPages] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);

  const [filtersPanel, setFiltersPanel] = useState(false);

  async function fetchCategory() {
    setLoading(true);

    try {
      const params = new URLSearchParams(searchParams);

      const response = await fetch(`/api/categories/${slug}?${params}`);

      const data = await response.json();

      setSubcategories(data.subcategories);

      setProducts(data.products);

      setFilters(data.filters);

      setTotalPages(data.totalPages);

      setCurrentPage(data.currentPage);

      const requestedPage = Number(params.get("page")) || 1;

      if (requestedPage !== data.currentPage) {
        params.set("page", data.currentPage);

        router.replace(`/categories/${slug}?${params}`);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPendingParams(new URLSearchParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    fetchCategory();
  }, [slug, searchParams]);

  function openFiltersPanel() {
    setFiltersPanel(true);
  }

  function closeFiltersPanel() {
    setFiltersPanel(false);
  }

  function selectedFilter(filter: string, value: string) {
    return pendingParams.getAll(filter).includes(value);
  }

  function toggleFilter(filter: string, value: string) {
    const params = new URLSearchParams(pendingParams);

    const values = params.getAll(filter);

    const exists = values.includes(value);

    const updated = exists
      ? values.filter((val) => val !== value)
      : [...values, value];

    params.delete(filter);

    for (const value of updated) {
      params.append(filter, value);
    }

    setPendingParams(params);
  }

  function applyFilters() {
    const params = new URLSearchParams(pendingParams);

    params.delete("page");

    router.push(`/categories/${slug}?${params}`);

    closeFiltersPanel();
  }

  function resetFilters() {
    const params = new URLSearchParams(pendingParams);

    for (const filter of filters) {
      params.delete(filter.slug);
    }

    params.delete("page");

    router.push(`/categories/${slug}?${params}`);

    closeFiltersPanel();
  }

  function changeSort(sort: string) {
    const params = new URLSearchParams(searchParams);

    sort ? params.set("sort", sort) : params.delete("sort");

    params.delete("page");

    router.push(`/categories/${slug}?${params}`);
  }

  function changePage(page: number) {
    const params = new URLSearchParams(searchParams);

    params.set("page", page.toString());

    router.push(`/categories/${slug}?${params}`);
  }

  function Stars({ rating }: { rating: number }) {
    const stars = [1, 2, 3, 4, 5];

    return (
      <div className="flex gap-1">
        {stars.map((star) => {
          if (rating >= star) {
            return <div key={star}>★</div>;
          }

          if (rating >= star - 0.5) {
            return <div key={star}>⯪</div>;
          }

          return <div key={star}>☆</div>;
        })}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-1">
        <Loader className="h-4 w-4 animate-spin" />

        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Failed To Load Page
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {subcategories.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/categories/${subcategory.slug}`}
              className="flex flex-col divide-y divide-[#1a1a1a] border border-[#1a1a1a] bg-[#0d0d0d] focus:outline-none"
            >
              <div className="relative aspect-[2/1]">
                <img
                  src={subcategory.image}
                  className="absolute h-full w-full object-contain"
                />
              </div>

              <div className="p-4 text-center font-bold">
                {subcategory.name}
              </div>
            </Link>
          ))}
        </div>
      )}

      {filters.length > 0 && (
        <div className="flex gap-4">
          <button
            onClick={openFiltersPanel}
            className="cursor-pointer focus:outline-none"
          >
            <Funnel className="h-4 w-4" />
          </button>

          <div className="relative">
            <select
              value={searchParams.get("sort") || "created-new-old"}
              onChange={(event) => changeSort(event.target.value)}
              className="peer cursor-pointer border-b border-[#1a1a1a] pr-4 whitespace-nowrap focus:outline-none"
            >
              <option value="newest">Newest</option>

              <option value="oldest">Oldest</option>

              <option value="name-a-z">Name (A-Z)</option>

              <option value="name-z-a">Name (Z-A)</option>

              <option value="price-low-high">Price (Low-High)</option>

              <option value="price-high-low">Price (High-Low)</option>

              <option value="discount-low-high">Discount (Low-High)</option>

              <option value="discount-high-low">Discount (High-Low)</option>

              <option value="rating-low-high">Rating (Low-High)</option>

              <option value="rating-high-low">Rating (High-Low)</option>

              <option value="reviews-low-high">Reviews (Low-High)</option>

              <option value="reviews-high-low">Reviews (High-Low)</option>
            </select>

            <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

            <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
          </div>
        </div>
      )}

      {products.length === 0 &&
      (subcategories.length === 0 || filters.length > 0) ? (
        <div className="flex flex-1 items-center justify-center">
          No Products
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="flex flex-col divide-y divide-[#1a1a1a] border border-[#1a1a1a] bg-[#0d0d0d] focus:outline-none"
            >
              <div className="relative aspect-square">
                <img
                  src={
                    product.images.find((image: any) => image.position === 1)
                      .url
                  }
                  className="absolute h-full w-full object-contain"
                />
              </div>

              <div className="flex flex-col gap-4 p-4">
                <div className="text-center font-bold">{product.name}</div>

                {product.reviews > 0 && (
                  <div className="flex justify-center gap-1">
                    <Stars rating={product.rating} />

                    <div>({product.reviews})</div>
                  </div>
                )}

                {product.discount > 0 ? (
                  <div className="flex flex-wrap justify-center gap-x-1 whitespace-nowrap">
                    <div>
                      {product.net.toFixed(2)} {product.currency}
                    </div>

                    <div className="line-through">
                      {product.price.toFixed(2)} {product.currency}
                    </div>

                    <div>-{product.discount}%</div>
                  </div>
                ) : (
                  <div className="text-center whitespace-nowrap">
                    {product.price.toFixed(2)} {product.currency}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {filters.length > 0 && (
        <div className="mt-auto flex items-center justify-center gap-4">
          <button
            disabled={currentPage <= 1}
            onClick={() => changePage(currentPage - 1)}
            className="cursor-pointer focus:outline-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div>
            Page {currentPage}/{totalPages}
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => changePage(currentPage + 1)}
            className="cursor-pointer focus:outline-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {filtersPanel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xl">
          <div className="flex h-full w-full flex-col border-r border-[#1a1a1a] bg-black lg:w-[25vw]">
            <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <div className="text-xl font-bold">Filters</div>

              <button
                onClick={closeFiltersPanel}
                className="cursor-pointer focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col divide-y divide-[#1a1a1a] overflow-y-auto p-4">
              {filters.map((filter) => (
                <div key={filter.slug} className="py-4 first:pt-0 last:pb-0">
                  <div className="font-bold">{filter.label}</div>

                  {filter.values.length === 0 ? (
                    <div>No Values</div>
                  ) : (
                    filter.values.map((value: any) => (
                      <button
                        key={value.slug}
                        onClick={() => toggleFilter(filter.slug, value.slug)}
                        className="flex cursor-pointer items-center gap-1 focus:outline-none"
                      >
                        <div className="flex h-4 w-4 shrink-0 items-center border border-[#1a1a1a] bg-[#0d0d0d]">
                          {selectedFilter(filter.slug, value.slug) && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>

                        <div>{value.label}</div>
                      </button>
                    ))
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#1a1a1a] border-t border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <div className="flex justify-center pr-4">
                <button
                  onClick={applyFilters}
                  className="flex cursor-pointer items-center gap-1 focus:outline-none"
                >
                  <Check className="h-4 w-4" />

                  <div>Apply</div>
                </button>
              </div>

              <div className="flex justify-center pl-4">
                <button
                  onClick={resetFilters}
                  className="flex cursor-pointer items-center gap-1 focus:outline-none"
                >
                  <RotateCcw className="h-4 w-4" />

                  <div>Reset</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
