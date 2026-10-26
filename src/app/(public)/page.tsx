"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Loader } from "lucide-react";

export default function Page() {
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [loadingBanners, setLoadingBanners] = useState(true);

  const [error, setError] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  const [banners, setBanners] = useState<any[]>([]);

  const [currentBanner, setCurrentBanner] = useState(0);

  async function fetchCategories() {
    setLoadingCategories(true);

    try {
      const response = await fetch("/api/categories");

      const data = await response.json();

      setCategories(data.categories);
    } catch {
      setError(true);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function fetchBanners() {
    setLoadingBanners(true);

    try {
      const response = await fetch("/api/banners");

      const data = await response.json();

      setBanners(data.banners);
    } catch {
      setError(true);
    } finally {
      setLoadingBanners(false);
    }
  }

  useEffect(() => {
    fetchCategories();

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(
      () => setCurrentBanner((index) => (index + 1) % banners.length),
      10000,
    );

    return () => clearInterval(interval);
  }, [banners.length]);

  if (loadingCategories || loadingBanners) {
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
    <div className="flex flex-col gap-4 p-4">
      {banners.length > 0 && (
        <div className="relative aspect-[4/1]">
          {banners.map((banner, index) => (
            <img
              key={banner.id}
              src={banner.image}
              className={`absolute h-full w-full object-cover transition-opacity duration-1000 ${
                index === currentBanner
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            />
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex cursor-pointer flex-col divide-y divide-[#1a1a1a] border border-[#1a1a1a] bg-[#0d0d0d] focus:outline-none"
            >
              <div className="relative aspect-[2/1]">
                <img
                  src={category.image}
                  className="absolute h-full w-full object-contain"
                />
              </div>

              <div className="p-4 text-center font-bold">{category.name}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
