"use client";

import { createClient } from "@supabase/supabase-js";

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

import { loadCart, saveCart, changeQuantity, removeItem } from "@/lib/cart";

import {
  Loader,
  Minus,
  Plus,
  ShoppingCartMinus,
  ScrollText,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export default function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [cart, setCart] = useState<any[]>([]);

  const [total, setTotal] = useState(0);

  const [currency, setCurrency] = useState("");

  async function updateCart(cart: any[], initial = false) {
    if (initial) {
      setLoading(true);
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ cart: cart }),
      });

      const data = await response.json();

      saveCart(
        data.cart.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      );

      setCart(data.cart);

      setTotal(data.total);

      setCurrency(data.currency);
    } catch {
      setError(true);
    } finally {
      if (initial) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const cart = loadCart();

    updateCart(cart, true);

    const channel = supabase
      .channel("cart")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "product_options" },
        async (payload) => {
          const cart = loadCart();

          const exists = cart.some((item: any) => item.id === payload.new.id);

          if (!exists) {
            return;
          }

          await updateCart(cart);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    function syncCart() {
      const cart = loadCart();

      updateCart(cart);
    }

    window.addEventListener("storage", syncCart);

    return () => window.removeEventListener("storage", syncCart);
  }, []);

  function updateItemQuantity(id: string, quantity: number) {
    updateCart(changeQuantity(id, quantity));
  }

  function removeFromCart(id: string) {
    updateCart(removeItem(id));
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

  if (cart.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Cart Is Empty
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="flex flex-col divide-y divide-[#1a1a1a] p-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="h-16 w-16 shrink-0">
                <img
                  src={
                    item.images.find((image: any) => image.position === 1).url
                  }
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <div className="font-bold">{item.name}</div>

                {item.options.length > 1 && <div>{item.value}</div>}

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

              <div className="flex gap-4">
                {item.stock < 1 ? (
                  <div className="text-center">Out Of Stock</div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateItemQuantity(
                          item.id,
                          Math.max(item.quantity - 1, 1),
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="cursor-pointer focus:outline-none"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItemQuantity(
                          item.id,
                          Math.max(
                            Math.min(
                              Math.floor(Number(event.target.value)),
                              item.stock,
                            ),
                            1,
                          ),
                        )
                      }
                      style={{ width: `${String(item.quantity).length}ch` }}
                      className="border-b border-[#1a1a1a] focus:outline-none"
                    />

                    <button
                      onClick={() =>
                        updateItemQuantity(
                          item.id,
                          Math.min(item.quantity + 1, item.stock),
                        )
                      }
                      disabled={item.quantity >= item.stock}
                      className="cursor-pointer focus:outline-none"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="cursor-pointer focus:outline-none"
                >
                  <ShoppingCartMinus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-4 border-t border-[#1a1a1a] p-4">
          <div className="font-bold">Total</div>

          <div className="whitespace-nowrap">
            {total.toFixed(2)} {currency}
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push("/checkout")}
        className="flex cursor-pointer items-center gap-1 self-center focus:outline-none"
      >
        <ScrollText className="h-4 w-4" />

        <div>Proceed To Checkout</div>
      </button>
    </div>
  );
}
