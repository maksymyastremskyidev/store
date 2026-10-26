"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { useState, useEffect, Suspense } from "react";

import CouponCreationModal from "@/app/components/coupon-creation-modal";

import CouponUpdateModal from "@/app/components/coupon-update-modal";

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

  const [coupons, setCoupons] = useState<any[]>([]);

  const [filters, setFilters] = useState<any[]>([]);

  const [id, setId] = useState("");

  const [code, setCode] = useState("");

  const [discount, setDiscount] = useState("");

  const [limit, setLimit] = useState("");

  const [expires, setExpires] = useState("");

  const [couponCreationModal, setCouponCreationModal] = useState(false);

  const [couponUpdateModal, setCouponUpdateModal] = useState(false);

  const [filtersPanel, setFiltersPanel] = useState(false);

  async function fetchCoupons() {
    setLoading(true);

    try {
      const params = new URLSearchParams(searchParams);

      const response = await fetch(`/api/admin/coupons?${params}`);

      const data = await response.json();

      setCoupons(data.coupons);

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
    fetchCoupons();
  }, [searchParams]);

  function localDateTime(input: string) {
    const date = new Date(input);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");

    const minutes = String(date.getMinutes()).padStart(2, "0");

    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  function openCouponCreationModal() {
    setCouponCreationModal(true);
  }

  function closeCouponCreationModal() {
    setCode("");

    setDiscount("");

    setLimit("");

    setExpires("");

    setCouponCreationModal(false);
  }

  function openCouponUpdateModal(coupon: any) {
    setId(coupon.id);

    setCode(coupon.code);

    setDiscount(coupon.discount);

    setLimit(coupon.limit);

    setExpires(localDateTime(coupon.expires));

    setCouponUpdateModal(true);
  }

  function closeCouponUpdateModal() {
    setId("");

    setCode("");

    setDiscount("");

    setLimit("");

    setExpires("");

    setCouponUpdateModal(false);
  }

  function openFiltersPanel() {
    setFiltersPanel(true);
  }

  function closeFiltersPanel() {
    setFiltersPanel(false);
  }

  async function createCoupon(event: any) {
    event.preventDefault();

    const response = await fetch("/api/admin/coupons", {
      method: "POST",
      body: JSON.stringify({
        code: code,
        discount: discount,
        limit: limit,
        expires: expires,
      }),
    });

    if (!response.ok) {
      alert("Failed To Create Coupon");

      return;
    }

    await fetchCoupons();

    closeCouponCreationModal();
  }

  async function updateCoupon(event: any, id: string) {
    event.preventDefault();

    const response = await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        code: code,
        discount: discount,
        limit: limit,
        expires: expires,
      }),
    });

    if (!response.ok) {
      alert("Failed To Update Coupon");

      return;
    }

    await fetchCoupons();

    closeCouponUpdateModal();
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Are You Sure You Want To Delete This Coupon?")) {
      return;
    }

    const response = await fetch(`/api/admin/coupons/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Failed To Delete Coupon");

      return;
    }

    await fetchCoupons();
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

    router.push(`/admin/coupons?${params}`);

    closeFiltersPanel();
  }

  function resetFilters() {
    const params = new URLSearchParams(pendingParams);

    for (const filter of filters) {
      params.delete(filter.slug);
    }

    router.push(`/admin/coupons?${params}`);

    closeFiltersPanel();
  }

  function searchInput(query: string) {
    const params = new URLSearchParams(pendingParams);

    query ? params.set("query", query) : params.delete("query");

    setPendingParams(params);
  }

  function applySearch() {
    const params = new URLSearchParams(pendingParams);

    router.push(`/admin/coupons?${params}`);
  }

  function resetSearch() {
    const params = new URLSearchParams(pendingParams);

    params.delete("query");

    params.delete("page");

    setPendingParams(params);

    router.push(`/admin/coupons?${params}`);
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

    router.push(`/admin/coupons?${params}`);
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
        {coupons.length} {coupons.length === 1 ? "Coupon" : "Coupons"}
      </div>

      <div className="flex gap-4">
        <button
          onClick={openCouponCreationModal}
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

            <option value="expires-first-last">Expires (First-Last)</option>

            <option value="expires-last-first">Expires (Last-First)</option>

            <option value="code-a-z">Code (A-Z)</option>

            <option value="code-z-a">Code (Z-A)</option>

            <option value="discount-low-high">Discount (Low-High)</option>

            <option value="discount-high-low">Discount (High-Low)</option>

            <option value="used-low-high">Used (Low-High)</option>

            <option value="used-high-low">Used (High-Low)</option>

            <option value="limit-low-high">Limit (Low-High)</option>

            <option value="limit-high-low">Limit (High-Low)</option>
          </select>

          <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

          <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
        </div>
      </div>

      {coupons.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          No Coupons
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#1a1a1a] bg-[#0d0d0d]">
          <table className="w-full">
            <thead className="border-b border-[#1a1a1a]">
              <tr>
                <th className="p-4">Code</th>

                <th className="p-4">Discount</th>

                <th className="p-4">Used</th>

                <th className="p-4">Limit</th>

                <th className="p-4">Expires</th>

                <th className="p-4">Created</th>

                <th className="p-4">Updated</th>

                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1a1a1a]">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="p-4 text-center">{coupon.code}</td>

                  <td className="p-4 text-center whitespace-nowrap">
                    -{coupon.discount}%
                  </td>

                  <td className="p-4 text-center">{coupon.used}</td>

                  <td className="p-4 text-center">{coupon.limit}</td>

                  <td className="p-4 text-center">
                    <div>{new Date(coupon.expires).toLocaleDateString()}</div>

                    <div>{new Date(coupon.expires).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4 text-center">
                    <div>{new Date(coupon.created).toLocaleDateString()}</div>

                    <div>{new Date(coupon.created).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4 text-center">
                    <div>{new Date(coupon.updated).toLocaleDateString()}</div>

                    <div>{new Date(coupon.updated).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => openCouponUpdateModal(coupon)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => deleteCoupon(coupon.id)}
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

      <CouponCreationModal
        couponCreationModal={couponCreationModal}
        code={code}
        setCode={setCode}
        discount={discount}
        setDiscount={setDiscount}
        limit={limit}
        setLimit={setLimit}
        expires={expires}
        setExpires={setExpires}
        createCoupon={createCoupon}
        closeCouponCreationModal={closeCouponCreationModal}
      />

      <CouponUpdateModal
        couponUpdateModal={couponUpdateModal}
        id={id}
        code={code}
        setCode={setCode}
        discount={discount}
        setDiscount={setDiscount}
        limit={limit}
        setLimit={setLimit}
        expires={expires}
        setExpires={setExpires}
        updateCoupon={updateCoupon}
        closeCouponUpdateModal={closeCouponUpdateModal}
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
