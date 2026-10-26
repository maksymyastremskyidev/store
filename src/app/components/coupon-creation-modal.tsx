"use client";

import { X, Check } from "lucide-react";

export default function CouponCreationModal(props: any) {
  const {
    couponCreationModal,
    code,
    setCode,
    discount,
    setDiscount,
    limit,
    setLimit,
    expires,
    setExpires,
    createCoupon,
    closeCouponCreationModal,
  } = props;

  if (!couponCreationModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <div className="flex h-full w-full flex-col border border-[#1a1a1a] bg-black lg:h-auto lg:max-h-[75vh] lg:w-auto lg:max-w-[75vw]">
        <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <div className="text-xl font-bold">Create Coupon</div>

          <button
            onClick={closeCouponCreationModal}
            className="cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => createCoupon(event)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              placeholder="Code"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />

            <input
              type="number"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              min={0}
              max={100}
              step={1}
              required
              placeholder="Discount"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />

            <input
              type="number"
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              min={0}
              step={1}
              required
              placeholder="Limit"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />

            <div>
              <div className="font-bold">Expires</div>

              <input
                type="datetime-local"
                value={expires}
                onChange={(event) => setExpires(event.target.value)}
                step="1"
                className="w-full border-b border-[#1a1a1a] focus:outline-none"
              />
            </div>
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
