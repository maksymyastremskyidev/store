"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { useState, useEffect, Suspense } from "react";

import BannerCreationModal from "@/app/components/banner-creation-modal";

import BannerUpdateModal from "@/app/components/banner-update-modal";

import {
  Loader,
  Plus,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash,
} from "lucide-react";

function Content() {
  const searchParams = useSearchParams();

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [banners, setBanners] = useState<any[]>([]);

  const [id, setId] = useState("");

  const [image, setImage] = useState("");

  const [bannerCreationModal, setBannerCreationModal] = useState(false);

  const [bannerUpdateModal, setBannerUpdateModal] = useState(false);

  async function fetchBanners() {
    setLoading(true);

    try {
      const params = new URLSearchParams(searchParams);

      const response = await fetch(`/api/admin/banners?${params}`);

      const data = await response.json();

      setBanners(data.banners);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBanners();
  }, [searchParams]);

  function openBannerCreationModal() {
    setBannerCreationModal(true);
  }

  function closeBannerCreationModal() {
    setImage("");

    setBannerCreationModal(false);
  }

  function openBannerUpdateModal(banner: any) {
    setId(banner.id);

    setImage(banner.image);

    setBannerUpdateModal(true);
  }

  function closeBannerUpdateModal() {
    setId("");

    setImage("");

    setBannerUpdateModal(false);
  }

  async function createBanner(event: any) {
    event.preventDefault();

    const response = await fetch("/api/admin/banners", {
      method: "POST",
      body: JSON.stringify({
        image: image,
      }),
    });

    if (!response.ok) {
      alert("Failed To Create Banner");

      return;
    }

    await fetchBanners();

    closeBannerCreationModal();
  }

  async function updateBanner(event: any, id: string) {
    event.preventDefault();

    const response = await fetch(`/api/admin/banners/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        image: image,
      }),
    });

    if (!response.ok) {
      alert("Failed To Update Banner");

      return;
    }

    await fetchBanners();

    closeBannerUpdateModal();
  }

  async function deleteBanner(id: string) {
    if (!confirm("Are You Sure You Want To Delete This Banner?")) {
      return;
    }

    const response = await fetch(`/api/admin/banners/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Failed To Delete Banner");

      return;
    }

    await fetchBanners();
  }

  function changeSort(sort: string) {
    const params = new URLSearchParams(searchParams);

    sort ? params.set("sort", sort) : params.delete("sort");

    router.push(`/admin/banners?${params}`);
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
        {banners.length} {banners.length === 1 ? "Banner" : "Banners"}
      </div>

      <div className="flex gap-4">
        <button
          onClick={openBannerCreationModal}
          className="cursor-pointer focus:outline-none"
        >
          <Plus className="h-4 w-4" />
        </button>

        <div className="relative">
          <select
            value={searchParams.get("sort") || "created-new-old"}
            onChange={(event) => changeSort(event.target.value)}
            className="peer cursor-pointer border-b border-[#1a1a1a] pr-4 whitespace-nowrap focus:outline-none"
          >
            <option value="created-new-old" className="bg-neutral-950">
              Created (New-Old)
            </option>

            <option value="created-old-new" className="bg-neutral-950">
              Created (Old-New)
            </option>

            <option value="updated-new-old" className="bg-neutral-950">
              Updated (New-Old)
            </option>

            <option value="updated-old-new" className="bg-neutral-950">
              Updated (Old-New)
            </option>
          </select>

          <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

          <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
        </div>
      </div>

      {banners.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          No Banners
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#1a1a1a] bg-[#0d0d0d]">
          <table className="w-full">
            <thead className="border-b border-[#1a1a1a]">
              <tr>
                <th className="p-4">Image</th>

                <th className="p-4">Created</th>

                <th className="p-4">Updated</th>

                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1a1a1a]">
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td className="p-4">
                    <div className="mx-auto h-16 w-16">
                      <img
                        src={banner.image}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div>{new Date(banner.created).toLocaleDateString()}</div>

                    <div>{new Date(banner.created).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4 text-center">
                    <div>{new Date(banner.updated).toLocaleDateString()}</div>

                    <div>{new Date(banner.updated).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => openBannerUpdateModal(banner)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => deleteBanner(banner.id)}
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

      <BannerCreationModal
        bannerCreationModal={bannerCreationModal}
        image={image}
        setImage={setImage}
        createBanner={createBanner}
        closeBannerCreationModal={closeBannerCreationModal}
      />

      <BannerUpdateModal
        bannerUpdateModal={bannerUpdateModal}
        id={id}
        image={image}
        setImage={setImage}
        updateBanner={updateBanner}
        closeBannerUpdateModal={closeBannerUpdateModal}
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
