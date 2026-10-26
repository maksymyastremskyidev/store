const key = "cart";

export function loadCart() {
  if (typeof window === "undefined") {
    return [];
  }

  return JSON.parse(localStorage.getItem(key) || "[]");
}

export function saveCart(cart: any[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(cart));

  window.dispatchEvent(new Event("cart"));
}

export function addItem(option: any) {
  if (option.stock < 1) {
    return loadCart();
  }

  const cart = loadCart();

  const exists = cart.find((item: any) => item.id === option.id);

  const items = exists
    ? cart.map((item: any) =>
        item.id === option.id
          ? {
              ...item,
              quantity: Math.min(item.quantity + option.quantity, option.stock),
            }
          : item,
      )
    : [
        ...cart,
        { ...option, quantity: Math.min(option.quantity, option.stock) },
      ];

  saveCart(items);

  return items;
}

export function changeQuantity(id: string, quantity: number) {
  const cart = loadCart();

  const items = cart.map((item: any) =>
    item.id === id ? { ...item, quantity } : item,
  );

  saveCart(items);

  return items;
}

export function removeItem(id: string) {
  const cart = loadCart();

  const items = cart.filter((item: any) => item.id !== id);

  saveCart(items);

  return items;
}
