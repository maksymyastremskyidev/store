"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { useState, useEffect, Suspense } from "react";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
  TooltipContentProps,
  Tooltip,
} from "recharts";

import { Loader, Funnel, X, Check, RotateCcw } from "lucide-react";

function Content() {
  const searchParams = useSearchParams();

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [filtersPanel, setFiltersPanel] = useState(false);

  const today = new Date();

  const [from, setFrom] = useState(
    searchParams.get("from") ||
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`,
  );

  const [to, setTo] = useState(
    searchParams.get("to") ||
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
  );

  const months =
    (new Date(to).getFullYear() - new Date(from).getFullYear()) * 12 +
    (new Date(to).getMonth() - new Date(from).getMonth());

  const [charts, setCharts] = useState<any>(null);

  async function fetchCharts() {
    setLoading(true);

    try {
      const params = new URLSearchParams(searchParams);

      const response = await fetch(`/api/admin/dashboard?${params}`);

      const data = await response.json();

      setCharts(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCharts();
  }, [searchParams]);

  function openFiltersPanel() {
    setFiltersPanel(true);
  }

  function closeFiltersPanel() {
    setFiltersPanel(false);
  }

  function applyDates() {
    const params = new URLSearchParams(searchParams);

    params.set("from", from);

    params.set("to", to);

    router.push(`/admin/dashboard?${params}`);

    closeFiltersPanel();
  }

  function resetDates() {
    setFrom(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`,
    );

    setTo(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    );

    router.push("/admin/dashboard");

    closeFiltersPanel();
  }

  function formatLabel(label: string) {
    if (months > 12) {
      return label;
    }

    if (months > 1) {
      return label.replace("-", ".");
    }

    return label.replaceAll("-", ".");
  }

  function customTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) {
      return null;
    }

    const value = payload[0]?.value;

    return (
      <div>
        {formatLabel(String(label))} - {value}
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
    <div className="flex flex-col gap-4 overflow-clip p-4">
      <div className="flex gap-4">
        <button
          onClick={openFiltersPanel}
          className="cursor-pointer focus:outline-none"
        >
          <Funnel className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="font-bold">Revenue</div>

          <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
            <ResponsiveContainer height={256}>
              <AreaChart
                data={charts.revenue}
                margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
              >
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="4 4" />

                <XAxis dataKey="label" height={0} />

                <YAxis allowDecimals={false} width={0} />

                <Area
                  dataKey="value"
                  activeDot={{ stroke: "#1a1a1a" }}
                  stroke="#1a1a1a"
                  strokeWidth={4}
                  fill="#1a1a1a"
                  fillOpacity={0.5}
                />

                <Tooltip content={customTooltip} cursor={{ opacity: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="font-bold">Orders</div>

          <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
            <ResponsiveContainer height={256}>
              <AreaChart
                data={charts.orders}
                margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
              >
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="4 4" />

                <XAxis dataKey="label" height={0} />

                <YAxis allowDecimals={false} width={0} />

                <Area
                  dataKey="value"
                  activeDot={{ stroke: "#1a1a1a" }}
                  stroke="#1a1a1a"
                  strokeWidth={4}
                  fill="#1a1a1a"
                  fillOpacity={0.5}
                />

                <Tooltip content={customTooltip} cursor={{ opacity: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="font-bold">Statuses</div>

          <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
            <ResponsiveContainer height={256}>
              <BarChart
                data={charts.statuses}
                layout="vertical"
                margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
              >
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="4 4" />

                <XAxis type="number" allowDecimals={false} height={0} />

                <YAxis type="category" dataKey="label" width={0} />

                <Bar dataKey="value" fill="#1a1a1a" />

                <Tooltip content={customTooltip} cursor={{ opacity: 0 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="font-bold">Carriers</div>

          <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
            <ResponsiveContainer height={256}>
              <BarChart
                data={charts.carriers}
                layout="vertical"
                margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
              >
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="4 4" />

                <XAxis type="number" allowDecimals={false} height={0} />

                <YAxis type="category" dataKey="label" width={0} />

                <Bar dataKey="value" fill="#1a1a1a" />

                <Tooltip content={customTooltip} cursor={{ opacity: 0 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="font-bold">Deliveries</div>

          <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
            <ResponsiveContainer height={256}>
              <BarChart
                data={charts.deliveries}
                layout="vertical"
                margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
              >
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="4 4" />

                <XAxis type="number" allowDecimals={false} height={0} />

                <YAxis type="category" dataKey="label" width={0} />

                <Bar dataKey="value" fill="#1a1a1a" />

                <Tooltip content={customTooltip} cursor={{ opacity: 0 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="font-bold">Payments</div>

          <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
            <ResponsiveContainer height={256}>
              <BarChart
                data={charts.payments}
                layout="vertical"
                margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
              >
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="4 4" />

                <XAxis type="number" allowDecimals={false} height={0} />

                <YAxis type="category" dataKey="label" width={0} />

                <Bar dataKey="value" fill="#1a1a1a" />

                <Tooltip content={customTooltip} cursor={{ opacity: 0 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="font-bold">10 Best Selling Products</div>

          <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
            <ResponsiveContainer height={256}>
              <BarChart
                data={charts.products}
                layout="vertical"
                margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
              >
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="4 4" />

                <XAxis type="number" allowDecimals={false} height={0} />

                <YAxis type="category" dataKey="label" width={0} />

                <Bar dataKey="value" fill="#1a1a1a" />

                <Tooltip content={customTooltip} cursor={{ opacity: 0 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="font-bold">10 Best Selling Categories</div>

          <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
            <ResponsiveContainer height={256}>
              <BarChart
                data={charts.categories}
                layout="vertical"
                margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
              >
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="4 4" />

                <XAxis type="number" allowDecimals={false} height={0} />

                <YAxis type="category" dataKey="label" width={0} />

                <Bar dataKey="value" fill="#1a1a1a" />

                <Tooltip content={customTooltip} cursor={{ opacity: 0 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              <div>
                <div className="font-bold">From</div>

                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="w-full border-b border-[#1a1a1a] focus:outline-none"
                />
              </div>

              <div>
                <div className="font-bold">To</div>

                <input
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="w-full border-b border-[#1a1a1a] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#1a1a1a] border-t border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <div className="flex justify-center pr-4">
                <button
                  onClick={applyDates}
                  className="flex cursor-pointer items-center gap-1 focus:outline-none"
                >
                  <Check className="h-4 w-4" />

                  <div>Apply</div>
                </button>
              </div>

              <div className="flex justify-center pl-4">
                <button
                  onClick={resetDates}
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
