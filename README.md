# Description

A full-stack e-commerce application built with Next.js, TypeScript, Supabase, and Tailwind CSS, featuring a modern online store and a comprehensive admin panel.

# Demo

[https://maksymyastremskyidev-store.vercel.app/](https://maksymyastremskyidev-store.vercel.app/)

# Demo Admin Credentials

- **Email:** johndoe@email.com
- **Password:** John-1234

# Features

- Responsive, minimalist dark UI
- User authentication and account management
- Product catalog with hierarchical category navigation, search, filtering, and sorting
- Cart with real-time synchronization
- Checkout with coupon support
- Order history and product reviews
- Admin panel with analytics dashboard and CRUD functionality
- Protected admin routes and pages

# Tech Stack

- Next.js
- TypeScript
- Supabase
- Tailwind CSS

# Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/maksymyastremskyidev/store
```

## 2. Navigate to the project directory

```bash
cd store
```

## 3. Install dependencies

```bash
npm install
```

## 4. Set up environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_DEFAULT=

SUPABASE_SECRET=

JWT_SECRET=
```

## 5. Set up the database

```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  admin boolean NOT NULL DEFAULT false,
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image text NOT NULL,
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent uuid NULL REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  image text NOT NULL,
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  price numeric NOT NULL,
  discount int4 NOT NULL,
  currency text NOT NULL,
  description text NOT NULL,
  active boolean NOT NULL DEFAULT false,
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  position int4 NOT NULL
);

CREATE TABLE public.product_specifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute text NOT NULL,
  value text NOT NULL,
  position int4 NOT NULL
);

CREATE TABLE public.product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute text NOT NULL,
  value text NOT NULL,
  sku text NOT NULL UNIQUE,
  stock int4 NOT NULL,
  position int4 NOT NULL
);

CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  "user" uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  rating int4 NOT NULL,
  comment text NULL,
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount int4 NOT NULL,
  "limit" int4 NOT NULL,
  used int4 NOT NULL DEFAULT 0,
  expires timestamptz NOT NULL DEFAULT now(),
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user" uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  postal text NOT NULL,
  carrier text NOT NULL,
  delivery text NOT NULL,
  payment text NOT NULL,
  code text NULL,
  discount int4 NOT NULL,
  subtotal numeric NOT NULL,
  total numeric NOT NULL,
  currency text NOT NULL,
  number text NOT NULL UNIQUE,
  status text NOT NULL,
  tracking text NULL UNIQUE,
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product uuid NULL REFERENCES public.products(id) ON DELETE SET NULL,
  image text NOT NULL,
  name text NOT NULL,
  options int4 NOT NULL,
  attribute text NOT NULL,
  value text NOT NULL,
  sku text NOT NULL,
  price numeric NOT NULL,
  discount int4 NOT NULL,
  net numeric NOT NULL,
  currency text NOT NULL,
  quantity int4 NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public.users,
  public.banners,
  public.categories,
  public.products,
  public.product_images,
  public.product_specifications,
  public.product_options,
  public.product_reviews,
  public.coupons,
  public.orders,
  public.order_items
FROM anon;

GRANT SELECT ON TABLE
  public.banners,
  public.categories,
  public.products,
  public.product_images,
  public.product_specifications,
  public.product_options,
  public.product_reviews
TO anon;

CREATE POLICY "Public can read banners"
ON public.banners
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public can read products"
ON public.products
FOR SELECT
TO anon
USING (active = true);

CREATE POLICY "Public can read product images"
ON public.product_images
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.products AS product
    WHERE product.id = product_images.product
      AND product.active = true
  )
);

CREATE POLICY "Public can read product specifications"
ON public.product_specifications
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.products AS product
    WHERE product.id = product_specifications.product
      AND product.active = true
  )
);

CREATE POLICY "Public can read product options"
ON public.product_options
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.products AS product
    WHERE product.id = product_options.product
      AND product.active = true
  )
);

CREATE POLICY "Public can read product reviews"
ON public.product_reviews
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.products AS product
    WHERE product.id = product_reviews.product
      AND product.active = true
  )
);

ALTER PUBLICATION supabase_realtime
ADD TABLE public.product_options;
```

## 6. Start the development server

```bash
npm run dev
```
