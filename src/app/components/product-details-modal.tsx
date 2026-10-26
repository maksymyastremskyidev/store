"use client";

import { useState, useEffect } from "react";

import { X } from "lucide-react";

export default function ProductDetailsModal(props: any) {
  const { productDetailsModal, product, closeProductDetailsModal } = props;

  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (!product) {
      return;
    }

    const firstImage = [...product.images].sort(
      (a: any, b: any) => a.position - b.position,
    )[0];

    if (firstImage) {
      setSelectedImage(firstImage.url);
    }
  }, [product]);

  function Stars({ rating }: { rating: number }) {
    const stars = [1, 2, 3, 4, 5];

    return (
      <div className="flex gap-1">
        {stars.map((star) => {
          if (rating >= star) {
            return <div key={star}>★</div>;
          }

          if (rating >= star - 0.5) {
            return <div key={star}>⯪</div>;
          }

          return <div key={star}>☆</div>;
        })}
      </div>
    );
  }

  if (!productDetailsModal || !product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <div className="flex h-full w-full flex-col border border-[#1a1a1a] bg-black lg:h-auto lg:max-h-[75vh] lg:w-auto lg:max-w-[75vw]">
        <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <div className="text-xl font-bold">Product Details</div>

          <button
            onClick={closeProductDetailsModal}
            className="cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto p-4 focus:outline-none lg:grid-cols-2">
          <div className="flex flex-col gap-4 lg:sticky lg:top-0 lg:self-start">
            <div className="h-[50vh] border border-[#1a1a1a] bg-[#0d0d0d]">
              {selectedImage && (
                <img
                  src={selectedImage}
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <div className="overflow-x-auto">
              <div className="flex w-max min-w-full justify-center gap-4">
                {[...product.images]
                  .sort((a: any, b: any) => a.position - b.position)
                  .map((image: any) => (
                    <div
                      key={image.id}
                      className="h-16 w-16 cursor-pointer border border-[#1a1a1a] bg-[#0d0d0d]"
                    >
                      <img
                        src={image.url}
                        onClick={() => setSelectedImage(image.url)}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between gap-1">
              <div className="font-bold">Name</div>

              <div className="text-right">{product.name}</div>
            </div>

            <div className="flex justify-between gap-1">
              <div className="font-bold">Category</div>

              <div className="text-right">{product.category.name}</div>
            </div>

            <div className="flex justify-between gap-1">
              <div className="font-bold">Price</div>

              {product.discount > 0 ? (
                <div className="flex flex-wrap justify-end gap-x-1 whitespace-nowrap">
                  <div>
                    {product.net.toFixed(2)} {product.currency}
                  </div>

                  <div className="line-through">
                    {product.price.toFixed(2)} {product.currency}
                  </div>

                  <div>-{product.discount}%</div>
                </div>
              ) : (
                <div className="whitespace-nowrap">
                  {product.price.toFixed(2)} {product.currency}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-1">
              <div className="font-bold">Sold</div>

              <div>{product.sold}</div>
            </div>

            <div className="flex justify-between gap-1">
              <div className="font-bold">Rating</div>

              <div className="flex gap-1">
                <Stars rating={product.rating} />

                <div>({product.reviews.length})</div>
              </div>
            </div>

            <div className="flex justify-between gap-1">
              <div className="font-bold">Active</div>

              <div>{product.active ? "Yes" : "No"}</div>
            </div>

            <div className="flex justify-between gap-1">
              <div className="font-bold">Created</div>

              <div className="flex flex-wrap justify-end gap-x-1">
                <div>{new Date(product.created).toLocaleDateString()}</div>

                <div>{new Date(product.created).toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="flex justify-between gap-1">
              <div className="font-bold">Updated</div>

              <div className="flex flex-wrap justify-end gap-x-1">
                <div>{new Date(product.updated).toLocaleDateString()}</div>

                <div>{new Date(product.updated).toLocaleTimeString()}</div>
              </div>
            </div>

            <div>
              <div className="font-bold">Description</div>

              <div className="border border-[#1a1a1a] bg-[#0d0d0d] p-4 text-justify whitespace-pre-line">
                {product.description}
              </div>
            </div>

            <div>
              <div className="font-bold">Specifications</div>

              <div className="overflow-x-auto border border-[#1a1a1a] bg-[#0d0d0d]">
                <table className="w-full">
                  <thead className="border-b border-[#1a1a1a]">
                    <tr>
                      <th className="p-4">Attribute</th>

                      <th className="p-4">Value</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#1a1a1a]">
                    {[...product.specifications]
                      .sort((a: any, b: any) => a.position - b.position)
                      .map((specification: any) => (
                        <tr key={specification.id}>
                          <td className="p-4 text-center whitespace-nowrap">
                            {specification.attribute}
                          </td>

                          <td className="p-4 text-center whitespace-nowrap">
                            {specification.value}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="font-bold">Options</div>

              <div className="overflow-x-auto border border-[#1a1a1a] bg-[#0d0d0d]">
                <table className="w-full">
                  <thead className="border-b border-[#1a1a1a]">
                    <tr>
                      <th className="p-4">Attribute</th>

                      <th className="p-4">Value</th>

                      <th className="p-4">SKU</th>

                      <th className="p-4">Stock</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#1a1a1a]">
                    {[...product.options]
                      .sort((a: any, b: any) => a.position - b.position)
                      .map((option: any) => (
                        <tr key={option.id}>
                          <td className="p-4 text-center whitespace-nowrap">
                            {option.attribute}
                          </td>

                          <td className="p-4 text-center whitespace-nowrap">
                            {option.value}
                          </td>

                          <td className="p-4 text-center">{option.sku}</td>

                          <td className="p-4 text-center">{option.stock}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {product.reviews.length > 0 && (
              <div>
                <div className="font-bold">Reviews</div>

                <div className="flex flex-col gap-4">
                  {product.reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="flex flex-col gap-4 border border-[#1a1a1a] bg-[#0d0d0d] p-4"
                    >
                      <div className="flex justify-between gap-1">
                        <div className="font-bold">{review.name}</div>

                        <div>
                          {new Date(review.created).toLocaleDateString()}
                        </div>
                      </div>

                      <Stars rating={review.rating} />

                      {review.comment && <div>{review.comment}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
