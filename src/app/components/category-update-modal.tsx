"use client";

import { X, ChevronDown, ChevronUp, Check } from "lucide-react";

export default function CategoryUpdateModal(props: any) {
  const {
    categoryUpdateModal,
    id,
    categories,
    categoryOptions,
    parent,
    setParent,
    name,
    setName,
    image,
    setImage,
    updateCategory,
    closeCategoryUpdateModal,
  } = props;

  if (!categoryUpdateModal || !id) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <div className="flex h-full w-full flex-col border border-[#1a1a1a] bg-black lg:h-auto lg:max-h-[75vh] lg:w-auto lg:max-w-[75vw]">
        <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <div className="text-xl font-bold">Update Category</div>

          <button
            onClick={closeCategoryUpdateModal}
            className="cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => updateCategory(event, id)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="relative">
              <select
                value={parent}
                onChange={(event) => setParent(event.target.value)}
                className={`peer w-full cursor-pointer border-b border-[#1a1a1a] pr-4 focus:outline-none ${
                  parent === "" ? "text-white/50" : "text-white"
                }`}
              >
                <option value="" hidden>
                  Parent
                </option>

                <option value="">None</option>

                {categoryOptions(categories)}
              </select>

              <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

              <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
            </div>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Name"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />

            <input
              type="text"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              required
              placeholder="Image"
              className="border-b border-[#1a1a1a] focus:outline-none"
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
