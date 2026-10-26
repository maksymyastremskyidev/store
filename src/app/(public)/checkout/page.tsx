"use client";

import { createClient } from "@supabase/supabase-js";

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

import { loadCart, saveCart } from "@/lib/cart";

import { Loader, ChevronDown, ChevronUp, Check } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export default function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [cart, setCart] = useState<any[]>([]);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [country, setCountry] = useState("");

  const [city, setCity] = useState("");

  const [address, setAddress] = useState("");

  const [postal, setPostal] = useState("");

  const [carrier, setCarrier] = useState("");

  const [delivery, setDelivery] = useState("");

  const [payment, setPayment] = useState("");

  const [code, setCode] = useState("");

  const [discount, setDiscount] = useState(0);

  const [subtotal, setSubtotal] = useState(0);

  const [currency, setCurrency] = useState("");

  async function updateCart(cart: any[]) {
    setLoading(true);

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

      setSubtotal(data.total);

      setCurrency(data.currency);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cart = loadCart();

    updateCart(cart);

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

  async function applyCoupon() {
    const response = await fetch("/api/coupons", {
      method: "POST",
      body: JSON.stringify({
        code: code,
      }),
    });

    if (!response.ok) {
      alert("Invalid Coupon");

      setDiscount(0);

      return;
    }

    const data = await response.json();

    setDiscount(data.discount);
  }

  async function placeOrder(event: any) {
    event.preventDefault();

    const response = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        country: country,
        city: city,
        address: address,
        postal: postal,
        carrier: carrier,
        delivery: delivery,
        payment: payment,
        code: code,
        cart: cart,
      }),
    });

    if (!response.ok) {
      alert("Failed To Place Order");

      return;
    }

    saveCart([]);

    setCart([]);

    alert("Order Placed Successfully");

    router.push("/");
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
    <form
      onSubmit={(event) => placeOrder(event)}
      className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2"
    >
      <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
        <div>
          <div className="font-bold">Contact Information</div>

          <div className="flex flex-col gap-4 border border-[#1a1a1a] bg-[#0d0d0d] p-4">
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="Email"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />

            <input
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              placeholder="Phone"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="font-bold">Delivery & Payment</div>

          <div className="flex flex-col gap-4 border border-[#1a1a1a] bg-[#0d0d0d] p-4">
            <input
              type="text"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              required
              placeholder="Country"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />

            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
              placeholder="City"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />

            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
              placeholder="Address"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />

            <input
              type="text"
              value={postal}
              onChange={(event) => setPostal(event.target.value)}
              required
              placeholder="Postcode"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />

            <div className="relative">
              <select
                value={carrier}
                onChange={(event) => setCarrier(event.target.value)}
                required
                className={`peer w-full cursor-pointer border-b border-[#1a1a1a] pr-4 focus:outline-none ${
                  carrier === "" ? "text-white/50" : "text-white"
                }`}
              >
                <option value="" hidden>
                  Carrier
                </option>

                <option value="Ukrposhta">Ukrposhta</option>

                <option value="Nova Post">Nova Post</option>
              </select>

              <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

              <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
            </div>

            <div className="relative">
              <select
                value={delivery}
                onChange={(event) => setDelivery(event.target.value)}
                required
                className={`peer w-full cursor-pointer border-b border-[#1a1a1a] pr-4 focus:outline-none ${
                  delivery === "" ? "text-white/50" : "text-white"
                }`}
              >
                <option value="" hidden>
                  Delivery
                </option>

                <option value="Pickup">Pickup</option>

                <option value="Courier">Courier</option>
              </select>

              <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

              <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
            </div>

            <div className="relative">
              <select
                value={payment}
                onChange={(event) => setPayment(event.target.value)}
                required
                className={`peer w-full cursor-pointer border-b border-[#1a1a1a] pr-4 focus:outline-none ${
                  payment === "" ? "text-white/50" : "text-white"
                }`}
              >
                <option value="" hidden>
                  Payment
                </option>

                <option value="Cash">Cash</option>

                <option value="Bank Transfer">Bank Transfer</option>
              </select>

              <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

              <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <div className="font-bold">Order Summary</div>

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
                        item.images.find((image: any) => image.position === 1)
                          .url
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

                  {item.stock < 1 ? (
                    <div className="text-center">Out Of Stock</div>
                  ) : (
                    <div>{item.quantity}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 border-t border-[#1a1a1a] p-4">
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyCoupon();
                  }
                }}
                placeholder="Code"
                className="border-b border-[#1a1a1a] focus:outline-none"
              />

              <div className="flex justify-between gap-4">
                <div className="font-bold">Discount</div>

                <div>-{discount}%</div>
              </div>

              <div className="flex justify-between gap-4">
                <div className="font-bold">Subtotal</div>

                <div className="whitespace-nowrap">
                  {subtotal.toFixed(2)} {currency}
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <div className="font-bold">Total</div>

                <div className="whitespace-nowrap">
                  {(subtotal * (1 - discount / 100)).toFixed(2)} {currency}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex cursor-pointer items-center gap-1 self-center focus:outline-none"
        >
          <Check className="h-4 w-4" />

          <div>Submit</div>
        </button>
      </div>
    </form>
  );
}
