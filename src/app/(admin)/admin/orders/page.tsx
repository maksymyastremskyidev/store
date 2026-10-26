"use client";

import { createClient } from "@supabase/supabase-js";

import { useSearchParams, useRouter } from "next/navigation";

import { useState, useEffect, Suspense } from "react";

import OrderDetailsModal from "@/app/components/order-details-modal";

import OrderUpdateModal from "@/app/components/order-update-modal";

import {
  Loader,
  Funnel,
  X,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

function Content() {
  const searchParams = useSearchParams();

  const [pendingParams, setPendingParams] = useState(
    new URLSearchParams(searchParams),
  );

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);

  const [filters, setFilters] = useState<any[]>([]);

  const [totalPages, setTotalPages] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);

  const [order, setOrder] = useState<any>(null);

  const [id, setId] = useState("");

  const [status, setStatus] = useState("");

  const [tracking, setTracking] = useState("");

  const [orderDetailsModal, setOrderDetailsModal] = useState(false);

  const [orderUpdateModal, setOrderUpdateModal] = useState(false);

  const [filtersPanel, setFiltersPanel] = useState(false);

  async function fetchOrders() {
    setLoading(true);

    try {
      const params = new URLSearchParams(searchParams);

      const response = await fetch(`/api/admin/orders?${params}`);

      const data = await response.json();

      setOrders(data.orders);

      setFilters(data.filters);

      setTotalPages(data.totalPages);

      setCurrentPage(data.currentPage);

      const requestedPage = Number(params.get("page")) || 1;

      if (requestedPage !== data.currentPage) {
        params.set("page", data.currentPage);

        router.replace(`/admin/orders?${params}`);
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
    fetchOrders();
  }, [searchParams]);

  useEffect(() => {
    const channel = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => fetchOrders(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function openOrderDetailsModal(order: any) {
    setOrder(order);

    setOrderDetailsModal(true);
  }

  function closeOrderDetailsModal() {
    setOrder(null);

    setOrderDetailsModal(false);
  }

  function openOrderUpdateModal(order: any) {
    setId(order.id);

    setStatus(order.status);

    setTracking(order.tracking || "");

    setOrderUpdateModal(true);
  }

  function closeOrderUpdateModal() {
    setId("");

    setStatus("");

    setTracking("");

    setOrderUpdateModal(false);
  }

  function openFiltersPanel() {
    setFiltersPanel(true);
  }

  function closeFiltersPanel() {
    setFiltersPanel(false);
  }

  async function updateOrder(event: any, id: string) {
    event.preventDefault();

    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: status,
        tracking: tracking,
      }),
    });

    if (!response.ok) {
      alert("Failed To Update Order");

      return;
    }

    await fetchOrders();

    closeOrderUpdateModal();
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

    router.push(`/admin/orders?${params}`);

    closeFiltersPanel();
  }

  function resetFilters() {
    const params = new URLSearchParams(pendingParams);

    for (const filter of filters) {
      params.delete(filter.slug);
    }

    params.delete("page");

    router.push(`/admin/orders?${params}`);

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

    router.push(`/admin/orders?${params}`);
  }

  function resetSearch() {
    const params = new URLSearchParams(pendingParams);

    params.delete("query");

    params.delete("page");

    setPendingParams(params);

    router.push(`/admin/orders?${params}`);
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

    router.push(`/admin/orders?${params}`);
  }

  function changePage(page: number) {
    const params = new URLSearchParams(searchParams);

    params.set("page", page.toString());

    router.push(`/admin/orders?${params}`);
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
        {orders.length} {orders.length === 1 ? "Order" : "Orders"}
      </div>

      <div className="flex gap-4">
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

            <option value="quantity-low-high">Quantity (Low-High)</option>

            <option value="quantity-high-low">Quantity (High-Low)</option>

            <option value="total-low-high">Total (Low-High)</option>

            <option value="total-high-low">Total (High-Low)</option>
          </select>

          <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

          <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">No Orders</div>
      ) : (
        <div className="overflow-x-auto border border-[#1a1a1a] bg-[#0d0d0d]">
          <table className="w-full">
            <thead className="border-b border-[#1a1a1a]">
              <tr>
                <th className="p-4">№</th>

                <th className="p-4">Status</th>

                <th className="p-4">Tracking</th>

                <th className="p-4">Carrier</th>

                <th className="p-4">Delivery</th>

                <th className="p-4">Payment</th>

                <th className="p-4">Quantity</th>

                <th className="p-4">Total</th>

                <th className="p-4">Created</th>

                <th className="p-4">Updated</th>

                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1a1a1a]">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="p-4 text-center">{order.number}</td>

                  <td className="p-4 text-center">{order.status}</td>

                  <td className="p-4 text-center">{order.tracking || "-"}</td>

                  <td className="p-4 text-center whitespace-nowrap">
                    {order.carrier}
                  </td>

                  <td className="p-4 text-center">{order.delivery}</td>

                  <td className="p-4 text-center">{order.payment}</td>

                  <td className="p-4 text-center">{order.quantity}</td>

                  <td className="p-4 text-center whitespace-nowrap">
                    <div>
                      {order.total.toFixed(2)} {order.currency}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div>{new Date(order.created).toLocaleDateString()}</div>

                    <div>{new Date(order.created).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4 text-center">
                    <div>{new Date(order.updated).toLocaleDateString()}</div>

                    <div>{new Date(order.updated).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => openOrderDetailsModal(order)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => openOrderUpdateModal(order)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Pencil className="h-4 w-4" />
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

      <OrderUpdateModal
        orderUpdateModal={orderUpdateModal}
        id={id}
        status={status}
        setStatus={setStatus}
        tracking={tracking}
        setTracking={setTracking}
        updateOrder={updateOrder}
        closeOrderUpdateModal={closeOrderUpdateModal}
      />

      <OrderDetailsModal
        orderDetailsModal={orderDetailsModal}
        order={order}
        closeOrderDetailsModal={closeOrderDetailsModal}
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
