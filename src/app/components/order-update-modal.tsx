"use client";

import { X, ChevronDown, ChevronUp, Check } from "lucide-react";

export default function OrderUpdateModal(props: any) {
  const {
    orderUpdateModal,
    id,
    status,
    setStatus,
    tracking,
    setTracking,
    updateOrder,
    closeOrderUpdateModal,
  } = props;

  if (!orderUpdateModal || !id) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <div className="flex h-full w-full flex-col border border-[#1a1a1a] bg-black lg:h-auto lg:max-h-[75vh] lg:w-auto lg:max-w-[75vw]">
        <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <div className="text-xl font-bold">Update Order</div>

          <button
            onClick={closeOrderUpdateModal}
            className="cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => updateOrder(event, id)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="relative">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={`peer w-full cursor-pointer border-b border-[#1a1a1a] pr-4 focus:outline-none ${
                  status === "" ? "text-white/50" : "text-white"
                }`}
              >
                <option value="Pending">Pending</option>

                <option value="Processing">Processing</option>

                <option value="Shipped">Shipped</option>

                <option value="Delivered">Delivered</option>

                <option value="Completed">Completed</option>

                <option value="Cancelled">Cancelled</option>

                <option value="Returned">Returned</option>

                <option value="Refunded">Refunded</option>
              </select>

              <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

              <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
            </div>

            <input
              type="text"
              value={tracking}
              onChange={(event) => setTracking(event.target.value)}
              placeholder="Tracking"
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
