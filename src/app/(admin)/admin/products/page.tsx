"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { useState, useEffect, Suspense } from "react";

import ProductCreationModal from "@/app/components/product-creation-modal";

import ProductsDiscountModal from "@/app/components/product-discount-modal";

import ProductDetailsModal from "@/app/components/product-details-modal";

import ProductUpdateModal from "@/app/components/product-update-modal";

import {
  Loader,
  Plus,
  Percent,
  Funnel,
  X,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function Content() {
  const searchParams = useSearchParams();

  const [pendingParams, setPendingParams] = useState(
    new URLSearchParams(searchParams),
  );

  const router = useRouter();

  const [loadingProducts, setLoadingProducts] = useState(true);

  const [loadingCategories, setLoadingCategories] = useState(true);

  const [error, setError] = useState(false);

  const [products, setProducts] = useState<any[]>([]);

  const [ids, setIds] = useState<any[]>([]);

  const [filters, setFilters] = useState<any[]>([]);

  const [totalPages, setTotalPages] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);

  const [categories, setCategories] = useState<any[]>([]);

  const [product, setProduct] = useState<any>(null);

  const [id, setId] = useState("");

  const [category, setCategory] = useState("");

  const [name, setName] = useState("");

  const [price, setPrice] = useState("");

  const [discount, setDiscount] = useState("");

  const [currency, setCurrency] = useState("");

  const [description, setDescription] = useState("");

  const [images, setImages] = useState([{ url: "" }]);

  const [specifications, setSpecifications] = useState([
    { attribute: "", value: "" },
  ]);

  const [options, setOptions] = useState([
    { attribute: "", value: "", sku: "", stock: "" },
  ]);

  const [active, setActive] = useState(false);

  const [productCreationModal, setProductCreationModal] = useState(false);

  const [productsDiscountModal, setProductsDiscountModal] = useState(false);

  const [productDetailsModal, setProductDetailsModal] = useState(false);

  const [productUpdateModal, setProductUpdateModal] = useState(false);

  const [filtersPanel, setFiltersPanel] = useState(false);

  async function fetchProducts() {
    setLoadingProducts(true);

    try {
      const params = new URLSearchParams(searchParams);

      const response = await fetch(`/api/admin/products?${params}`);

      const data = await response.json();

      setProducts(data.products);

      setIds(data.ids);

      setFilters(data.filters);

      setTotalPages(data.totalPages);

      setCurrentPage(data.currentPage);

      const requestedPage = Number(params.get("page")) || 1;

      if (requestedPage !== data.currentPage) {
        params.set("page", data.currentPage);

        router.replace(`/admin/products?${params}`);
      }
    } catch {
      setError(true);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function fetchCategories() {
    setLoadingCategories(true);

    try {
      const response = await fetch("/api/admin/categories");

      const data = await response.json();

      setCategories(data.categories);
    } catch {
      setError(true);
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    setPendingParams(new URLSearchParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
  }, []);

  function openProductCreationModal() {
    setProductCreationModal(true);
  }

  function closeProductCreationModal() {
    setCategory("");

    setName("");

    setPrice("");

    setDiscount("");

    setCurrency("");

    setDescription("");

    setImages([{ url: "" }]);

    setSpecifications([{ attribute: "", value: "" }]);

    setOptions([{ attribute: "", value: "", sku: "", stock: "" }]);

    setActive(false);

    setProductCreationModal(false);
  }

  function openProductsDiscountModal() {
    setProductsDiscountModal(true);
  }

  function closeProductsDiscountModal() {
    setDiscount("");

    setProductsDiscountModal(false);
  }

  function openProductDetailsModal(product: any) {
    setProduct(product);

    setProductDetailsModal(true);
  }

  function closeProductDetailsModal() {
    setProduct(null);

    setProductDetailsModal(false);
  }

  function openProductUpdateModal(product: any) {
    setId(product.id);

    setCategory(product.category.id);

    setName(product.name);

    setPrice(product.price);

    setDiscount(product.discount);

    setCurrency(product.currency);

    setDescription(product.description);

    setImages(
      [...product.images]
        .sort((a: any, b: any) => a.position - b.position)
        .map((image: any) => ({ ...image })),
    );

    setSpecifications(
      [...product.specifications]
        .sort((a: any, b: any) => a.position - b.position)
        .map((specification: any) => ({ ...specification })),
    );

    setOptions(
      [...product.options]
        .sort((a: any, b: any) => a.position - b.position)
        .map((option: any) => ({ ...option })),
    );

    setActive(product.active);

    setProductUpdateModal(true);
  }

  function closeProductUpdateModal() {
    setId("");

    setCategory("");

    setName("");

    setPrice("");

    setDiscount("");

    setCurrency("");

    setDescription("");

    setImages([{ url: "" }]);

    setSpecifications([{ attribute: "", value: "" }]);

    setOptions([{ attribute: "", value: "", sku: "", stock: "" }]);

    setActive(false);

    setProductUpdateModal(false);
  }

  function openFiltersPanel() {
    setFiltersPanel(true);
  }

  function closeFiltersPanel() {
    setFiltersPanel(false);
  }

  async function createProduct(event: any) {
    event.preventDefault();

    const response = await fetch("/api/admin/products", {
      method: "POST",
      body: JSON.stringify({
        category: category,
        name: name,
        price: price,
        discount: discount,
        currency: currency,
        description: description,
        images: images,
        specifications: specifications,
        options: options,
        active: active,
      }),
    });

    if (!response.ok) {
      alert("Failed To Create Product");

      return;
    }

    await fetchProducts();

    closeProductCreationModal();
  }

  async function applyDiscount(event: any) {
    event.preventDefault();

    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      body: JSON.stringify({
        ids: ids,
        discount: discount,
      }),
    });

    if (!response.ok) {
      alert("Failed To Apply Discount");

      return;
    }

    await fetchProducts();

    closeProductsDiscountModal();
  }

  async function updateProduct(event: any, id: string) {
    event.preventDefault();

    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        category: category,
        name: name,
        price: price,
        discount: discount,
        currency: currency,
        description: description,
        images: images,
        specifications: specifications,
        options: options,
        active: active,
      }),
    });

    if (!response.ok) {
      alert("Failed To Update Product");

      return;
    }

    await fetchProducts();

    closeProductUpdateModal();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Are You Sure You Want To Delete This Product?")) {
      return;
    }

    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Failed To Delete Product");

      return;
    }

    await fetchProducts();
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

    router.push(`/admin/products?${params}`);

    closeFiltersPanel();
  }

  function resetFilters() {
    const params = new URLSearchParams(pendingParams);

    for (const filter of filters) {
      params.delete(filter.slug);
    }

    params.delete("page");

    router.push(`/admin/products?${params}`);

    closeFiltersPanel();
  }

  function searchInput(query: string) {
    const params = new URLSearchParams(pendingParams);

    query ? params.set("query", query) : params.delete("query");

    params.delete("page");

    setPendingParams(params);
  }

  function applySearch() {
    const params = new URLSearchParams(pendingParams);

    params.delete("page");

    router.push(`/admin/products?${params}`);
  }

  function resetSearch() {
    const params = new URLSearchParams(pendingParams);

    params.delete("query");

    params.delete("page");

    setPendingParams(params);

    router.push(`/admin/products?${params}`);
  }

  function changeSearch(query: string) {
    if (!query && searchParams.has("query")) {
      resetSearch();

      return;
    }

    searchInput(query);
  }

  function changeSort(sort: string) {
    const params = new URLSearchParams(searchParams);

    sort ? params.set("sort", sort) : params.delete("sort");

    params.delete("page");

    router.push(`/admin/products?${params}`);
  }

  function changePage(page: number) {
    const params = new URLSearchParams(searchParams);

    params.set("page", page.toString());

    router.push(`/admin/products?${params}`);
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

  function categoryOptions(list: any[], accumulator: any[] = [], level = 0) {
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));

    for (const category of sorted) {
      accumulator.push(
        <option key={category.id} value={category.id}>
          {"- ".repeat(level)} {category.name}
        </option>,
      );

      if (category.children && category.children.length > 0) {
        categoryOptions(category.children, accumulator, level + 1);
      }
    }

    return accumulator;
  }

  if (loadingProducts || loadingCategories) {
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
      <div>
        {products.length} {products.length === 1 ? "Product" : "Products"}
      </div>

      <div className="flex gap-4">
        <button
          onClick={openProductCreationModal}
          className="cursor-pointer focus:outline-none"
        >
          <Plus className="h-4 w-4" />
        </button>

        <button
          onClick={openProductsDiscountModal}
          className="cursor-pointer focus:outline-none"
        >
          <Percent className="h-4 w-4" />
        </button>

        <button
          onClick={openFiltersPanel}
          className="cursor-pointer focus:outline-none"
        >
          <Funnel className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={pendingParams.get("query") || ""}
          onChange={(event) => changeSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              applySearch();
            }
          }}
          placeholder="Search"
          className="w-full border-b border-[#1a1a1a] focus:outline-none"
        />

        <div className="relative">
          <select
            value={searchParams.get("sort") || "created-new-old"}
            onChange={(event) => changeSort(event.target.value)}
            className="peer cursor-pointer border-b border-[#1a1a1a] pr-4 whitespace-nowrap focus:outline-none"
          >
            <option value="created-new-old">Created (New-Old)</option>

            <option value="created-old-new">Created (Old-New)</option>

            <option value="updated-new-old">Updated (New-Old)</option>

            <option value="updated-old-new">Updated (Old-New)</option>

            <option value="name-a-z">Name (A-Z)</option>

            <option value="name-z-a">Name (Z-A)</option>

            <option value="category-a-z">Category (A-Z)</option>

            <option value="category-z-a">Category (Z-A)</option>

            <option value="price-low-high">Price (Low-High)</option>

            <option value="price-high-low">Price (High-Low)</option>

            <option value="discount-low-high">Discount (Low-High)</option>

            <option value="discount-high-low">Discount (High-Low)</option>

            <option value="sold-low-high">Sold (Low-High)</option>

            <option value="sold-high-low">Sold (High-Low)</option>

            <option value="rating-low-high">Rating (Low-High)</option>

            <option value="rating-high-low">Rating (High-Low)</option>

            <option value="reviews-low-high">Reviews (Low-High)</option>

            <option value="reviews-high-low">Reviews (High-Low)</option>
          </select>

          <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

          <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          No Products
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#1a1a1a] bg-[#0d0d0d]">
          <table className="w-full">
            <thead className="border-b border-[#1a1a1a]">
              <tr>
                <th className="p-4">Image</th>

                <th className="p-4">Name</th>

                <th className="p-4">Category</th>

                <th className="p-4">Price</th>

                <th className="p-4">Sold</th>

                <th className="p-4">Rating</th>

                <th className="p-4">Active</th>

                <th className="p-4">Created</th>

                <th className="p-4">Updated</th>

                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1a1a1a]">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="p-4">
                    <div className="mx-auto h-16 w-16">
                      <img
                        src={
                          product.images.find(
                            (image: any) => image.position === 1,
                          ).url
                        }
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </td>

                  <td className="p-4 text-center whitespace-nowrap">
                    {product.name}
                  </td>

                  <td className="p-4 text-center whitespace-nowrap">
                    {product.category.name}
                  </td>

                  <td className="p-4 text-center whitespace-nowrap">
                    {product.discount > 0 ? (
                      <div>
                        <div>
                          {product.net.toFixed(2)} {product.currency}
                        </div>

                        <div className="line-through">
                          {product.price.toFixed(2)} {product.currency}
                        </div>

                        <div>-{product.discount}%</div>
                      </div>
                    ) : (
                      <div>
                        {product.price.toFixed(2)} {product.currency}
                      </div>
                    )}
                  </td>

                  <td className="p-4 text-center">{product.sold}</td>

                  <td className="p-4">
                    <div className="flex justify-center gap-1">
                      <Stars rating={product.rating} />

                      <div>({product.reviews.length})</div>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    {product.active ? "Yes" : "No"}
                  </td>

                  <td className="p-4 text-center">
                    <div>{new Date(product.created).toLocaleDateString()}</div>

                    <div>{new Date(product.created).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4 text-center">
                    <div>{new Date(product.updated).toLocaleDateString()}</div>

                    <div>{new Date(product.updated).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => openProductDetailsModal(product)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => openProductUpdateModal(product)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

      <ProductCreationModal
        productCreationModal={productCreationModal}
        categories={categories}
        categoryOptions={categoryOptions}
        category={category}
        setCategory={setCategory}
        name={name}
        setName={setName}
        price={price}
        setPrice={setPrice}
        discount={discount}
        setDiscount={setDiscount}
        currency={currency}
        setCurrency={setCurrency}
        description={description}
        setDescription={setDescription}
        images={images}
        setImages={setImages}
        specifications={specifications}
        setSpecifications={setSpecifications}
        options={options}
        setOptions={setOptions}
        active={active}
        setActive={setActive}
        createProduct={createProduct}
        closeProductCreationModal={closeProductCreationModal}
      />

      <ProductsDiscountModal
        productsDiscountModal={productsDiscountModal}
        discount={discount}
        setDiscount={setDiscount}
        applyDiscount={applyDiscount}
        closeProductsDiscountModal={closeProductsDiscountModal}
      />

      <ProductDetailsModal
        productDetailsModal={productDetailsModal}
        product={product}
        closeProductDetailsModal={closeProductDetailsModal}
      />

      <ProductUpdateModal
        productUpdateModal={productUpdateModal}
        id={id}
        categories={categories}
        categoryOptions={categoryOptions}
        category={category}
        setCategory={setCategory}
        name={name}
        setName={setName}
        price={price}
        setPrice={setPrice}
        discount={discount}
        setDiscount={setDiscount}
        currency={currency}
        setCurrency={setCurrency}
        description={description}
        setDescription={setDescription}
        images={images}
        setImages={setImages}
        specifications={specifications}
        setSpecifications={setSpecifications}
        options={options}
        setOptions={setOptions}
        active={active}
        setActive={setActive}
        updateProduct={updateProduct}
        closeProductUpdateModal={closeProductUpdateModal}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center gap-1">
          <Loader className="h-4 w-4 animate-spin" />

          <div>Loading...</div>
        </div>
      }
    >
      <Content />
    </Suspense>
  );
}
