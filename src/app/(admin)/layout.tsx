"use client";

import { useState } from "react";

import Link from "next/link";

import { Menu, X, UserRound } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navigationPanel, setNavigationPanel] = useState(false);

  function openNavigationPanel() {
    setNavigationPanel(true);
  }

  function closeNavigationPanel() {
    setNavigationPanel(false);
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white [color-scheme:dark]">
      <nav className="z-40 flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
        <button
          onClick={openNavigationPanel}
          className="cursor-pointer focus:outline-none"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link href="/" className="text-xl font-bold focus:outline-none">
          STORE
        </Link>

        <Link href="/account" className="focus:outline-none">
          <UserRound className="h-4 w-4" />
        </Link>
      </nav>

      {navigationPanel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xl">
          <div className="flex h-full w-full flex-col border-r border-[#1a1a1a] bg-black lg:w-[25vw]">
            <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
              <div className="text-xl font-bold">Navigation</div>

              <button
                onClick={closeNavigationPanel}
                className="cursor-pointer focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col divide-y divide-[#1a1a1a] overflow-y-auto p-4">
              <div className="pb-4">
                <Link
                  href="/admin/dashboard"
                  onClick={closeNavigationPanel}
                  className="focus:outline-none"
                >
                  Dashboard
                </Link>
              </div>

              <div className="py-4">
                <Link
                  href="/admin/banners"
                  onClick={closeNavigationPanel}
                  className="focus:outline-none"
                >
                  Banners
                </Link>
              </div>

              <div className="py-4">
                <Link
                  href="/admin/categories"
                  onClick={closeNavigationPanel}
                  className="focus:outline-none"
                >
                  Categories
                </Link>
              </div>

              <div className="py-4">
                <Link
                  href="/admin/products"
                  onClick={closeNavigationPanel}
                  className="focus:outline-none"
                >
                  Products
                </Link>
              </div>

              <div className="py-4">
                <Link
                  href="/admin/coupons"
                  onClick={closeNavigationPanel}
                  className="focus:outline-none"
                >
                  Coupons
                </Link>
              </div>

              <div className="pt-4">
                <Link
                  href="/admin/orders"
                  onClick={closeNavigationPanel}
                  className="focus:outline-none"
                >
                  Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
