"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { useState, useEffect, Suspense } from "react";

import CategoryCreationModal from "@/app/components/category-creation-modal";

import CategoryUpdateModal from "@/app/components/category-update-modal";

import {
  Loader,
  Plus,
  Funnel,
  X,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash,
} from "lucide-react";

function Content() {
  const searchParams = useSearchParams();

  const [pendingParams, setPendingParams] = useState(
    new URLSearchParams(searchParams),
  );

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  const [filters, setFilters] = useState<any[]>([]);

  const [id, setId] = useState("");

  const [parent, setParent] = useState("");

  const [name, setName] = useState("");

  const [image, setImage] = useState("");

  const [categoryCreationModal, setCategoryCreationModal] = useState(false);

  const [categoryUpdateModal, setCategoryUpdateModal] = useState(false);

  const [filtersPanel, setFiltersPanel] = useState(false);

  async function fetchCategories() {
    setLoading(true);

    try {
      const params = new URLSearchParams(searchParams);

      const response = await fetch(`/api/admin/categories?${params}`);

      const data = await response.json();

      setCategories(data.categories);

      setFilters(data.filters);
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
    fetchCategories();
  }, [searchParams]);

  function openCategoryCreationModal() {
    setCategoryCreationModal(true);
  }

  function closeCategoryCreationModal() {
    setParent("");

    setName("");

    setImage("");

    setCategoryCreationModal(false);
  }

  function openCategoryUpdateModal(category: any) {
    setId(category.id);

    setParent(category.parent?.id || "");

    setName(category.name);

    setImage(category.image);

    setCategoryUpdateModal(true);
  }

  function closeCategoryUpdateModal() {
    setId("");

    setName("");

    setParent("");

    setImage("");

    setCategoryUpdateModal(false);
  }

  function openFiltersPanel() {
    setFiltersPanel(true);
  }

  function closeFiltersPanel() {
    setFiltersPanel(false);
  }

  async function createCategory(event: any) {
    event.preventDefault();

    const response = await fetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({
        parent: parent,
        name: name,
        image: image,
      }),
    });

    if (!response.ok) {
      alert("Failed To Create Category");

      return;
    }

    await fetchCategories();

    closeCategoryCreationModal();
  }

  async function updateCategory(event: any, id: string) {
    event.preventDefault();

    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        parent: parent,
        name: name,
        image: image,
      }),
    });

    if (!response.ok) {
      alert("Failed To Update Category");

      return;
    }

    await fetchCategories();

    closeCategoryUpdateModal();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Are You Sure You Want To Delete This Category?")) {
      return;
    }

    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Failed To Delete Category");

      return;
    }

    await fetchCategories();
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

    router.push(`/admin/categories?${params}`);

    closeFiltersPanel();
  }

  function resetFilters() {
    const params = new URLSearchParams(pendingParams);

    for (const filter of filters) {
      params.delete(filter.slug);
    }

    router.push(`/admin/categories?${params}`);

    closeFiltersPanel();
  }

  function searchInput(query: string) {
    const params = new URLSearchParams(pendingParams);

    query ? params.set("query", query) : params.delete("query");

    setPendingParams(params);
  }

  function applySearch() {
    const params = new URLSearchParams(pendingParams);

    router.push(`/admin/categories?${params}`);
  }

  function resetSearch() {
    const params = new URLSearchParams(pendingParams);

    params.delete("query");

    params.delete("page");

    setPendingParams(params);

    router.push(`/admin/categories?${params}`);
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

    router.push(`/admin/categories?${params}`);
  }

  function categoriesTable(list: any[], accumulator: any[] = [], level = 0) {
    for (const category of list) {
      accumulator.push(
        <tr key={category.id}>
          <td className="p-4">
            <div className="mx-auto h-16 w-16">
              <img
                src={category.image}
                className="h-full w-full object-contain"
              />
            </div>
          </td>

          <td className="p-4 whitespace-nowrap">
            {"- ".repeat(level)} {category.name}
          </td>

          <td className="p-4 text-center whitespace-nowrap">
            {category.parent?.name || "None"}
          </td>

          <td className="p-4 text-center">{category.products}</td>

          <td className="p-4 text-center">{category.sold}</td>

          <td className="p-4 text-center">
            <div>{new Date(category.created).toLocaleDateString()}</div>

            <div>{new Date(category.created).toLocaleTimeString()}</div>
          </td>

          <td className="p-4 text-center">
            <div>{new Date(category.updated).toLocaleDateString()}</div>

            <div>{new Date(category.updated).toLocaleTimeString()}</div>
          </td>

          <td className="p-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => openCategoryUpdateModal(category)}
                className="cursor-pointer focus:outline-none"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                onClick={() => deleteCategory(category.id)}
                className="cursor-pointer focus:outline-none"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>,
      );

      if (category.children && category.children.length > 0) {
        categoriesTable(category.children, accumulator, level + 1);
      }
    }

    return accumulator;
  }

  function categoryOptions(
    list: any[],
    excluded: string | null = null,
    accumulator: any[] = [],
    level = 0,
  ) {
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));

    for (const category of sorted) {
      if (category.id === excluded) {
        continue;
      }

      accumulator.push(
        <option key={category.id} value={category.id}>
          {"- ".repeat(level)} {category.name}
        </option>,
      );

      if (category.children && category.children.length > 0) {
        categoryOptions(category.children, excluded, accumulator, level + 1);
      }
    }

    return accumulator;
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
      <div>
        {categories.length}{" "}
        {categories.length === 1 ? "Category" : "Categories"}
      </div>

      <div className="flex gap-4">
        <button
          onClick={openCategoryCreationModal}
          className="cursor-pointer focus:outline-none"
        >
          <Plus className="h-4 w-4" />
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

            <option value="products-low-high">Products (Low-High)</option>

            <option value="products-high-low">Products (High-Low)</option>

            <option value="sold-low-high">Sold (Low-High)</option>

            <option value="sold-high-low">Sold (High-Low)</option>
          </select>

          <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

          <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          No Categories
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#1a1a1a] bg-[#0d0d0d]">
          <table className="w-full">
            <thead className="border-b border-[#1a1a1a]">
              <tr>
                <th className="p-4">Image</th>

                <th className="p-4">Name</th>

                <th className="p-4">Parent</th>

                <th className="p-4">Products</th>

                <th className="p-4">Sold</th>

                <th className="p-4">Created</th>

                <th className="p-4">Updated</th>

                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1a1a1a]">
              {categoriesTable(categories)}
            </tbody>
          </table>
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

      <CategoryCreationModal
        categoryCreationModal={categoryCreationModal}
        categories={categories}
        categoryOptions={categoryOptions}
        parent={parent}
        setParent={setParent}
        name={name}
        setName={setName}
        image={image}
        setImage={setImage}
        createCategory={createCategory}
        closeCategoryCreationModal={closeCategoryCreationModal}
      />

      <CategoryUpdateModal
        categoryUpdateModal={categoryUpdateModal}
        id={id}
        categories={categories}
        categoryOptions={categoryOptions}
        parent={parent}
        setParent={setParent}
        name={name}
        setName={setName}
        image={image}
        setImage={setImage}
        updateCategory={updateCategory}
        closeCategoryUpdateModal={closeCategoryUpdateModal}
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
