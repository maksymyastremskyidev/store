"use client";

import { X, Check } from "lucide-react";

export default function ProductReviewModal(props: any) {
  const {
    productReviewModal,
    order,
    ratings,
    setRating,
    comments,
    setComment,
    reviewProduct,
    closeProductReviewModal,
  } = props;

  if (!productReviewModal || !order) {
    return null;
  }

  const items: any[] = [];

  for (const item of order.items) {
    if (!items.some((existing: any) => existing.product === item.product)) {
      items.push(item);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <div className="flex h-full w-full flex-col border border-[#1a1a1a] bg-black lg:h-auto lg:max-h-[75vh] lg:w-auto lg:max-w-[75vw]">
        <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <div className="text-xl font-bold">
            {items.length === 1 ? "Review Product" : "Review Products"}
          </div>

          <button
            onClick={closeProductReviewModal}
            className="cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => reviewProduct(event, items)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            {items.map((item: any) => (
              <div key={item.product} className="flex flex-col gap-4">
                <div className="flex items-center gap-4 border border-[#1a1a1a] bg-[#0d0d0d] p-4">
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

                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(item.product, star)}
                      className="cursor-pointer focus:outline-none"
                    >
                      {star <= ratings[item.product] ? "★" : "☆"}
                    </button>
                  ))}
                </div>

                <textarea
                  value={comments[item.product]}
                  onChange={(event) =>
                    setComment(item.product, event.target.value)
                  }
                  rows={1}
                  placeholder="Comment"
                  className="border-b border-[#1a1a1a] focus:outline-none"
                />
              </div>
            ))}
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
