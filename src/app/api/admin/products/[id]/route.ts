import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

import slugify from "slugify";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const category = body.category;

  const name = body.name?.trim();

  const price = Number(Number(body.price).toFixed(2));

  const discount = Number(Number(body.discount).toFixed(0));

  const currency = body.currency?.replace(/\s+/g, "").toUpperCase();

  const description = body.description?.trim();

  const images = Array.isArray(body.images)
    ? body.images.map((image: any) => ({
        ...image,
        url: image.url?.replace(/\s+/g, ""),
      }))
    : [];

  const specifications = Array.isArray(body.specifications)
    ? body.specifications.map((specification: any) => ({
        ...specification,
        attribute: specification.attribute?.trim(),
        value: specification.value?.trim(),
      }))
    : [];

  const options = Array.isArray(body.options)
    ? body.options.map((option: any) => ({
        ...option,
        attribute: option.attribute?.trim(),
        value: option.value?.trim(),
        sku: option.sku?.replace(/\s+/g, "").toUpperCase(),
        stock: Number(Number(option.stock).toFixed(0)),
      }))
    : [];

  const active = Boolean(body.active);

  if (
    !category ||
    !name ||
    isNaN(price) ||
    price < 0 ||
    isNaN(discount) ||
    discount < 0 ||
    discount > 100 ||
    !currency ||
    !description ||
    images.length === 0 ||
    images.some((image: any) => !image.remove && !image.url) ||
    specifications.length === 0 ||
    specifications.some(
      (specification: any) =>
        !specification.remove &&
        (!specification.attribute || !specification.value),
    ) ||
    options.length === 0 ||
    options.some(
      (option: any) =>
        !option.remove &&
        (!option.attribute ||
          !option.value ||
          !option.sku ||
          isNaN(option.stock) ||
          option.stock < 0),
    )
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { error: productUpdateError } = await supabase
    .from("products")
    .update({
      category: category,
      name: name,
      slug: slugify(name, { lower: true, strict: true }),
      price: price,
      discount: discount,
      currency: currency,
      description: description,
      active: active,
      updated: new Date().toISOString(),
    })
    .eq("id", id);

  if (productUpdateError) {
    console.error("Failed To Update Product:", productUpdateError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  for (const image of images) {
    if (image.id) {
      if (image.remove) {
        const { error: imageDeletionError } = await supabase
          .from("product_images")
          .delete()
          .eq("id", image.id);

        if (imageDeletionError) {
          console.error("Failed To Delete Image:", imageDeletionError);

          return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
          );
        }
      } else {
        const { error: imageUpdateError } = await supabase
          .from("product_images")
          .update({ url: image.url })
          .eq("id", image.id);

        if (imageUpdateError) {
          console.error("Failed To Update Image:", imageUpdateError);

          return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
          );
        }
      }
    } else if (!image.remove) {
      const { data: lastImage, error: lastImageSelectionError } = await supabase
        .from("product_images")
        .select()
        .eq("product", id)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      if (lastImageSelectionError) {
        console.error("Failed To Select Last Image:", lastImageSelectionError);

        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }

      const { error: imageInsertionError } = await supabase
        .from("product_images")
        .insert({
          product: id,
          url: image.url,
          position: lastImage.position + 1,
        });

      if (imageInsertionError) {
        console.error("Failed To Insert Image:", imageInsertionError);

        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    }
  }

  for (const specification of specifications) {
    if (specification.id) {
      if (specification.remove) {
        const { error: specificationDeletionError } = await supabase
          .from("product_specifications")
          .delete()
          .eq("id", specification.id);

        if (specificationDeletionError) {
          console.error(
            "Failed To Delete Specification:",
            specificationDeletionError,
          );

          return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
          );
        }
      } else {
        const { error: specificationUpdateError } = await supabase
          .from("product_specifications")
          .update({
            attribute: specification.attribute,
            value: specification.value,
          })
          .eq("id", specification.id);

        if (specificationUpdateError) {
          console.error(
            "Failed To Update Specification:",
            specificationUpdateError,
          );

          return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
          );
        }
      }
    } else if (!specification.remove) {
      const {
        data: lastSpecification,
        error: lastSpecificationSelectionError,
      } = await supabase
        .from("product_specifications")
        .select()
        .eq("product", id)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      if (lastSpecificationSelectionError) {
        console.error(
          "Failed To Select Last Specification:",
          lastSpecificationSelectionError,
        );

        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }

      const { error: specificationInsertionError } = await supabase
        .from("product_specifications")
        .insert({
          product: id,
          attribute: specification.attribute,
          value: specification.value,
          position: lastSpecification.position + 1,
        });

      if (specificationInsertionError) {
        console.error(
          "Failed To Insert Specification:",
          specificationInsertionError,
        );

        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    }
  }

  for (const option of options) {
    if (option.id) {
      if (option.remove) {
        const { error: optionDeletionError } = await supabase
          .from("product_options")
          .delete()
          .eq("id", option.id);

        if (optionDeletionError) {
          console.error("Failed To Delete Option:", optionDeletionError);

          return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
          );
        }
      } else {
        const { error: optionUpdateError } = await supabase
          .from("product_options")
          .update({
            attribute: option.attribute,
            value: option.value,
            sku: option.sku,
            stock: option.stock,
          })
          .eq("id", option.id);

        if (optionUpdateError) {
          console.error("Failed To Update Option:", optionUpdateError);

          return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
          );
        }
      }
    } else if (!option.remove) {
      const { data: lastOption, error: lastOptionSelectionError } =
        await supabase
          .from("product_options")
          .select()
          .eq("product", id)
          .order("position", { ascending: false })
          .limit(1)
          .single();

      if (lastOptionSelectionError) {
        console.error(
          "Failed To Select Last Option:",
          lastOptionSelectionError,
        );

        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }

      const { error: optionInsertionError } = await supabase
        .from("product_options")
        .insert({
          product: id,
          attribute: option.attribute,
          value: option.value,
          sku: option.sku,
          stock: option.stock,
          position: lastOption.position + 1,
        });

      if (optionInsertionError) {
        console.error("Failed To Insert Option:", optionInsertionError);

        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { error: productDeletionError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (productDeletionError) {
    console.error("Failed To Delete Product:", productDeletionError);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
