"use client";

import { useState, useEffect } from "react";

import { loadCart } from "@/lib/cart";

import Link from "next/link";

import { Menu, X, Search, ShoppingCart, UserRound } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navigationPanel, setNavigationPanel] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  const [searchbar, setSearchbar] = useState(false);

  const [query, setQuery] = useState("");

  const [results, setResults] = useState<any[]>([]);

  const [cart, setCart] = useState(0);

  async function fetchCategories() {
    const response = await fetch("/api/categories");

    const data = await response.json();

    setCategories(data.categories);
  }

  async function fetchProducts() {
    if (query.length < 2) {
      setResults([]);

      return;
    }

    const params = new URLSearchParams({ query });

    const response = await fetch(`/api/search?${params}`);

    const data = await response.json();

    setResults(data.products);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [query]);

  useEffect(() => {
    function syncCart() {
      const cart = loadCart();

      setCart(
        cart.reduce((total: number, item: any) => total + item.quantity, 0),
      );
    }

    syncCart();

    window.addEventListener("cart", syncCart);

    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("cart", syncCart);

      window.removeEventListener("storage", syncCart);
    };
  }, []);

  function openNavigationPanel() {
    setNavigationPanel(true);
  }

  function closeNavigationPanel() {
    setNavigationPanel(false);
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white [color-scheme:dark]">
      <nav className="z-40 flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
        <div className="flex gap-4">
          <button
            onClick={openNavigationPanel}
            className="cursor-pointer focus:outline-none"
          >
            <Menu className="h-4 w-4" />
          </button>

          <button
            onClick={() => setSearchbar((open) => !open)}
            className="cursor-pointer focus:outline-none"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex flex-1 justify-center">
          <Link
            href="/"
            className={`inline-block text-xl font-bold focus:outline-none ${
              searchbar ? "invisible" : ""
            }`}
          >
            STORE
          </Link>

          {searchbar && (
            <div className="absolute inset-0 flex items-center">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="w-full border-b border-[#1a1a1a] focus:outline-none"
              />

              {results.length > 0 && (
                <div className="absolute top-full z-50 mt-1 w-full divide-y divide-[#1a1a1a] border border-[#1a1a1a] bg-[#0d0d0d]">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="block p-4"
                    >
                      {product.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link href="/cart" className="relative focus:outline-none">
            <ShoppingCart className="h-4 w-4" />

            {cart > 0 && (
              <div className="absolute top-0 left-full -translate-y-1/2">
                {cart}
              </div>
            )}
          </Link>

          <Link href="/account" className="focus:outline-none">
            <UserRound className="h-4 w-4" />
          </Link>
        </div>
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
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className={
                    index === 0
                      ? "pb-4"
                      : index === categories.length - 1
                        ? "pt-4"
                        : "py-4"
                  }
                >
                  <Link
                    href={`/categories/${category.slug}`}
                    onClick={closeNavigationPanel}
                    className="focus:outline-none"
                  >
                    {category.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
