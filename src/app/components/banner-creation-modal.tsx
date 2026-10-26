"use client";

import { X, Check } from "lucide-react";

export default function BannerCreationModal(props: any) {
  const {
    bannerCreationModal,
    image,
    setImage,
    createBanner,
    closeBannerCreationModal,
  } = props;

  if (!bannerCreationModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <div className="flex h-full w-full flex-col border border-[#1a1a1a] bg-black lg:h-auto lg:max-h-[75vh] lg:w-auto lg:max-w-[75vw]">
        <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <div className="text-xl font-bold">Create Banner</div>

          <button
            onClick={closeBannerCreationModal}
            className="cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => createBanner(event)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 p-4">
            <input
              type="text"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              required
              placeholder="Image"
              className="w-full border-b border-[#1a1a1a] focus:outline-none"
            />
          </div>

          <div className="flex justify-center border-t border-[#1a1a1a] bg-[#0d0d0d] p-4">
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-1 focus:outline-none"
            >
              <Check className="h-4 w-4" />

              <div>Submit</div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
