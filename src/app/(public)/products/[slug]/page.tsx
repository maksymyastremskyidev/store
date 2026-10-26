"use client";

import { createClient } from "@supabase/supabase-js";

import { useParams } from "next/navigation";

import { useState, useEffect } from "react";

import { createPortal } from "react-dom";

import { addItem } from "@/lib/cart";

import {
  Loader,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  ShoppingCartPlus,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export default function Page() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [product, setProduct] = useState<any>(null);

  const [selectedImage, setSelectedImage] = useState("");

  const [fullScreen, setFullScreen] = useState(false);

  const [selectedOption, setSelectedOption] = useState<any>(null);

  const [quantity, setQuantity] = useState(1);

  async function fetchProduct() {
    setLoading(true);

    try {
      const response = await fetch(`/api/products/${slug}`);

      const data = await response.json();

      const firstImage = [...data.product.images].sort(
        (a: any, b: any) => a.position - b.position,
      )[0];

      const firstOption = [...data.product.options].sort(
        (a: any, b: any) => a.position - b.position,
      )[0];

      setProduct(data.product);

      setSelectedImage(firstImage.url);

      setSelectedOption(firstOption);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!selectedOption) {
      return;
    }

    setQuantity(1);
  }, [selectedOption?.id]);

  useEffect(() => {
    const channel = supabase
      .channel("product")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "product_options" },
        (payload) => {
          setProduct((product: any) => {
            if (!product) {
              return product;
            }

            return {
              ...product,
              options: product.options.map((option: any) =>
                option.id === payload.new.id
                  ? { ...option, stock: payload.new.stock }
                  : option,
              ),
            };
          });

          if (payload.new.id !== selectedOption?.id) {
            return;
          }

          setSelectedOption((option: any) => ({
            ...option,
            stock: payload.new.stock,
          }));

          setQuantity((quantity) => {
            if (payload.new.stock < 1) {
              return 0;
            }

            return Math.min(Math.max(quantity, 1), payload.new.stock);
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedOption?.id]);

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

  function addToCart() {
    if (!selectedOption) {
      return;
    }

    addItem({
      id: selectedOption.id,
      stock: selectedOption.stock,
      quantity: quantity,
    });

    setTimeout(() => {
      alert("Product Added To Cart Successfully");
    }, 0);
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
    <div className="grid grid-cols-1 gap-4 overflow-y-auto p-4 focus:outline-none lg:grid-cols-2">
      <div className="flex flex-col gap-4 lg:sticky lg:top-0 lg:self-start">
        <div className="h-[50vh] border border-[#1a1a1a] bg-[#0d0d0d]">
          {selectedImage && (
            <img
              src={selectedImage}
              onClick={() => setFullScreen(true)}
              className="h-full w-full cursor-zoom-in object-contain"
            />
          )}
        </div>

        {fullScreen &&
          createPortal(
            <img
              src={selectedImage}
              onClick={() => setFullScreen(false)}
              className="fixed inset-0 z-[50] h-full w-full cursor-zoom-out bg-black/50 object-contain backdrop-blur-xl"
            />,
            document.body,
          )}

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
        <div className="font-bold">{product.name}</div>

        {product.reviews.length > 0 && (
          <div className="flex gap-1">
            <Stars rating={product.rating} />

            <div>({product.reviews.length})</div>
          </div>
        )}

        {product.discount > 0 ? (
          <div className="flex flex-wrap gap-x-1 whitespace-nowrap">
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

        {product.options.length > 1 && (
          <div>
            <div className="relative w-fit">
              <select
                value={selectedOption.id}
                onChange={(event) => {
                  setSelectedOption(
                    product.options.find(
                      (option: any) => option.id === event.target.value,
                    ),
                  );
                }}
                className="peer cursor-pointer border-b border-[#1a1a1a] pr-4 whitespace-nowrap focus:outline-none"
              >
                {[...product.options]
                  .sort((a: any, b: any) => a.position - b.position)
                  .map((option: any) => (
                    <option key={option.id} value={option.id}>
                      {option.value}
                    </option>
                  ))}
              </select>

              <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

              <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
            </div>
          </div>
        )}

        {selectedOption.stock < 1 ? (
          <div>Out Of Stock</div>
        ) : (
          selectedOption && (
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQuantity(Math.max(quantity - 1, 1))}
                  disabled={quantity <= 1}
                  className="cursor-pointer focus:outline-none"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <input
                  type="number"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(
                        Math.min(
                          Math.floor(Number(event.target.value)),
                          selectedOption.stock,
                        ),
                        1,
                      ),
                    )
                  }
                  style={{ width: `${String(quantity).length}ch` }}
                  className="border-b border-[#1a1a1a] focus:outline-none"
                />

                <button
                  onClick={() =>
                    setQuantity(Math.min(quantity + 1, selectedOption.stock))
                  }
                  disabled={quantity >= selectedOption.stock}
                  className="cursor-pointer focus:outline-none"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={addToCart}
                className="flex cursor-pointer items-center gap-1 focus:outline-none"
              >
                <ShoppingCartPlus className="h-4 w-4" />

                <div>Add To Cart</div>
              </button>
            </div>
          )
        )}

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

                    <div>{new Date(review.created).toLocaleDateString()}</div>
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
  );
}
