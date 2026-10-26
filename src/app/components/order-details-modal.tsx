"use client";

import { X } from "lucide-react";

export default function OrderDetailsModal(props: any) {
  const { orderDetailsModal, order, closeOrderDetailsModal } = props;

  if (!orderDetailsModal || !order) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <div className="flex h-full w-full flex-col border border-[#1a1a1a] bg-black lg:h-auto lg:max-h-[75vh] lg:w-auto lg:max-w-[75vw]">
        <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <div className="text-xl font-bold">Order Details</div>

          <button
            onClick={closeOrderDetailsModal}
            className="cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto p-4 focus:outline-none lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div>
              <div className="font-bold">Order Information</div>

              <div className="flex flex-col gap-4 border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                <div className="flex justify-between gap-1">
                  <div className="font-bold">№</div>

                  <div>{order.number}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Status</div>

                  <div>{order.status}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Tracking</div>

                  <div>{order.tracking || "-"}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Created</div>

                  <div className="flex flex-wrap justify-end gap-x-1">
                    <div>{new Date(order.created).toLocaleDateString()}</div>

                    <div>{new Date(order.created).toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Updated</div>

                  <div className="flex flex-wrap justify-end gap-x-1">
                    <div>{new Date(order.updated).toLocaleDateString()}</div>

                    <div>{new Date(order.updated).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold">Contact Information</div>

              <div className="flex flex-col gap-4 border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                <div className="flex justify-between gap-1">
                  <div className="font-bold">Name</div>

                  <div className="text-right">{order.name}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Email</div>

                  <div>{order.email}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Phone</div>

                  <div className="text-right">{order.phone}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold">Delivery & Payment</div>

              <div className="flex flex-col gap-4 border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                <div className="flex justify-between gap-1">
                  <div className="font-bold">Country</div>

                  <div className="text-right">{order.country}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">City</div>

                  <div className="text-right">{order.city}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Address</div>

                  <div className="text-right">{order.address}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Postcode</div>

                  <div>{order.postal}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Carrier</div>

                  <div className="text-right">{order.carrier}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Delivery</div>

                  <div>{order.delivery}</div>
                </div>

                <div className="flex justify-between gap-1">
                  <div className="font-bold">Payment</div>

                  <div>{order.payment}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-0 lg:self-start">
            <div className="font-bold">Order Summary</div>

            <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
              <div className="flex flex-col divide-y divide-[#1a1a1a] p-4">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="h-16 w-16 shrink-0">
                      <img
                        src={item.image}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-4">
                      <div className="font-bold">{item.name}</div>

                      {item.options > 1 && <div>{item.value}</div>}

                      {item.discount > 0 ? (
                        <div className="flex flex-wrap gap-x-1 whitespace-nowrap">
                          <div>
                            {item.net.toFixed(2)} {item.currency}
                          </div>

                          <div className="line-through">
                            {item.price.toFixed(2)} {item.currency}
                          </div>

                          <div>-{item.discount}%</div>
                        </div>
                      ) : (
                        <div className="whitespace-nowrap">
                          {item.price.toFixed(2)} {item.currency}
                        </div>
                      )}
                    </div>

                    <div>{item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t border-[#1a1a1a] p-4">
                <div className="flex justify-between gap-4">
                  <div className="font-bold">Promo</div>

                  <div>{order.code || "-"}</div>
                </div>

                <div className="flex justify-between gap-4">
                  <div className="font-bold">Discount</div>

                  <div className="whitespace-nowrap">-{order.discount}%</div>
                </div>

                <div className="flex justify-between gap-4">
                  <div className="font-bold">Subtotal</div>

                  <div className="whitespace-nowrap">
                    {order.subtotal.toFixed(2)} {order.currency}
                  </div>
                </div>

                <div className="flex justify-between gap-4">
                  <div className="font-bold">Total</div>

                  <div className="whitespace-nowrap">
                    {order.total.toFixed(2)} {order.currency}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
